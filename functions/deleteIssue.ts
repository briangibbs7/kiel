import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issueId } = await req.json();
    
    // Fetch the issue
    const issue = await base44.entities.Issue.get(issueId);
    
    if (!issue) {
      return Response.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Check permissions: admin or creator
    const canDelete = user.role === 'admin' || issue.created_by === user.email;
    
    if (!canDelete) {
      return Response.json({ error: 'Forbidden: You can only delete your own issues' }, { status: 403 });
    }

    // Delete the issue
    await base44.entities.Issue.delete(issueId);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});