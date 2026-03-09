import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import AttachmentsPanel from "@/components/shared/AttachmentsPanel";

export default function IssueAttachments({ issue }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const attachments = issue.attachments || [];

  const handleUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const updated = [...attachments];
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updated.push({ name: file.name, url: file_url, size: file.size });
    }
    await base44.entities.Issue.update(issue.id, { attachments: updated });
    queryClient.invalidateQueries({ queryKey: ["issues"] });
    queryClient.invalidateQueries({ queryKey: ["all-issues"] });
    setUploading(false);
  };

  const handleRemove = async (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    await base44.entities.Issue.update(issue.id, { attachments: updated });
    queryClient.invalidateQueries({ queryKey: ["issues"] });
    queryClient.invalidateQueries({ queryKey: ["all-issues"] });
  };

  return (
    <AttachmentsPanel
      attachments={attachments}
      onUpload={handleUpload}
      onRemove={handleRemove}
      uploading={uploading}
    />
  );
}