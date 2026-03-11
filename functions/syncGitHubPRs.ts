import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { issue_id, github_repo, github_token } = await req.json();

    if (!github_token || !github_repo) {
      return Response.json({ error: 'Missing GitHub token or repo' }, { status: 400 });
    }

    // Parse owner/repo
    const [owner, repo] = github_repo.split('/');
    if (!owner || !repo) {
      return Response.json({ error: 'Invalid repo format (use owner/repo)' }, { status: 400 });
    }

    // Fetch PRs from GitHub
    const prResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${github_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!prResponse.ok) {
      return Response.json({ error: 'Failed to fetch PRs from GitHub' }, { status: 400 });
    }

    const prs = await prResponse.json();

    // Get existing links for this issue
    const existingLinks = await base44.asServiceRole.entities.GitHubLink.filter({
      issue_id,
      github_repo
    });

    const synced = [];

    // Sync each PR
    for (const pr of prs) {
      const existingLink = existingLinks.find(l => l.github_pr_number === pr.number);

      const linkData = {
        issue_id,
        github_repo,
        github_pr_number: pr.number,
        github_pr_title: pr.title,
        github_pr_url: pr.html_url,
        github_pr_status: pr.state === 'closed' ? (pr.merged_at ? 'merged' : 'closed') : 'open',
        last_synced: new Date().toISOString()
      };

      if (existingLink) {
        await base44.asServiceRole.entities.GitHubLink.update(existingLink.id, linkData);
      } else {
        await base44.asServiceRole.entities.GitHubLink.create(linkData);
      }

      synced.push({ number: pr.number, title: pr.title });
    }

    return Response.json({
      success: true,
      synced: synced.length,
      prs: synced.slice(0, 5)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});