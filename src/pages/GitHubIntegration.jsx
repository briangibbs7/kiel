import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GitHubIntegration() {
  const [showSetup, setShowSetup] = useState(false);

  const { data: links = [] } = useQuery({
    queryKey: ['allGithubLinks'],
    queryFn: () => base44.entities.GitHubLink.list()
  });

  const groupedByRepo = links.reduce((acc, link) => {
    if (!acc[link.github_repo]) acc[link.github_repo] = [];
    acc[link.github_repo].push(link);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'merged': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'closed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitBranch size={20} />
          GitHub Integration
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {/* Info section */}
          <div className="bg-[#161616] border border-[#252525] rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-white mb-2">How it works</h2>
            <ul className="text-xs text-[#999] space-y-1">
              <li>• Connect GitHub repositories to link PRs with issues</li>
              <li>• Automatically sync PR status and metadata</li>
              <li>• Track code changes alongside project work</li>
              <li>• Requires GitHub Personal Access Token with repo permissions</li>
            </ul>
          </div>

          {/* Linked repositories */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">Linked Repositories</h2>
            {Object.entries(groupedByRepo).length === 0 ? (
              <div className="text-center py-8 text-[#555]">
                <p className="text-sm">No linked repositories yet</p>
                <p className="text-xs mt-1">Connect GitHub repos from issue details</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedByRepo).map(([repo, prLinks]) => (
                  <div key={repo} className="bg-[#161616] border border-[#252525] rounded-lg p-4">
                    <h3 className="text-sm font-medium text-white mb-3">{repo}</h3>
                    <div className="space-y-2">
                      {prLinks.map(link => (
                        <div key={link.id} className="flex items-center justify-between p-2 bg-[#0D0D0D] rounded border border-[#1A1A1A]">
                          <div className="flex-1">
                            <a
                              href={link.github_pr_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#5E6AD2] hover:text-[#6B78E5] flex items-center gap-2"
                            >
                              #{link.github_pr_number} - {link.github_pr_title}
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-mono border ${getStatusColor(link.github_pr_status)}`}>
                            {link.github_pr_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Setup guide */}
          <div className="mt-8 bg-[#161616] border border-[#252525] rounded-lg p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Setup Instructions</h2>
            <ol className="text-xs text-[#999] space-y-2">
              <li>1. Go to GitHub Settings → Developer settings → Personal access tokens</li>
              <li>2. Create a new token with 'repo' and 'read:user' scopes</li>
              <li>3. Copy the token and navigate to an issue</li>
              <li>4. Click the GitHub panel and enter your repo and token</li>
              <li>5. Sync to fetch all PRs from that repository</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}