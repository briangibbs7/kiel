import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch, RefreshCw, ExternalLink, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GitHubPanel({ issueId }) {
  const [showConnect, setShowConnect] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const queryClient = useQueryClient();

  const { data: links = [] } = useQuery({
    queryKey: ['githubLinks', issueId],
    queryFn: () => base44.entities.GitHubLink.filter({ issue_id: issueId })
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('syncGitHubPRs', {
        issue_id: issueId,
        github_repo: githubRepo,
        github_token: githubToken
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['githubLinks'] });
      setGithubRepo('');
      setGithubToken('');
      setShowConnect(false);
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id) => base44.entities.GitHubLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['githubLinks'] });
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-400';
      case 'merged': return 'text-purple-400';
      case 'closed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-4 bg-[#161616] rounded-lg border border-[#252525]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <GitBranch size={14} />
          GitHub Integration
        </h3>
      </div>

      {showConnect ? (
        <div className="space-y-2 mb-3">
          <Input
            placeholder="Repository (owner/repo)"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="bg-[#0D0D0D] border-[#252525] text-sm"
          />
          <Input
            type="password"
            placeholder="GitHub Personal Access Token"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            className="bg-[#0D0D0D] border-[#252525] text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => syncMutation.mutate()}
              className="bg-[#5E6AD2] hover:bg-[#6B78E5] text-xs"
              disabled={!githubRepo || !githubToken}
            >
              <RefreshCw size={12} className="mr-1" />
              Sync PRs
            </Button>
            <Button
              onClick={() => setShowConnect(false)}
              variant="outline"
              className="border-[#252525] text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowConnect(true)}
          variant="outline"
          className="border-[#252525] gap-2 text-xs w-full mb-3"
        >
          <Link2 size={12} />
          Connect GitHub Repo
        </Button>
      )}

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map(link => (
            <div key={link.id} className="p-2 bg-[#0D0D0D] rounded border border-[#1A1A1A] text-xs">
              <div className="flex items-center justify-between">
                <a
                  href={link.github_pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#5E6AD2] hover:text-[#6B78E5]"
                >
                  #{link.github_pr_number}
                  <ExternalLink size={11} />
                </a>
                <span className={`font-mono text-[10px] ${getStatusColor(link.github_pr_status)}`}>
                  {link.github_pr_status.toUpperCase()}
                </span>
              </div>
              <p className="text-[#999] mt-1 truncate">{link.github_pr_title}</p>
              <button
                onClick={() => deleteLinkMutation.mutate(link.id)}
                className="text-[#555] hover:text-red-400 mt-1"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}