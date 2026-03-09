import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Paperclip, Upload, X, FileText, Image, File } from "lucide-react";

function getFileIcon(name) {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return Image;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText;
  return File;
}

export default function TaskAttachments({ task }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const attachments = task.attachments || [];

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    const newAttachments = [...attachments];

    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newAttachments.push({ name: file.name, url: file_url, size: file.size });
    }

    await base44.entities.Task.update(task.id, { attachments: newAttachments });
    queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
    setUploading(false);
  };

  const handleRemove = async (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    await base44.entities.Task.update(task.id, { attachments: updated });
    queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <h5 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Paperclip size={12} />
        Attachments {attachments.length > 0 && `(${attachments.length})`}
      </h5>

      {/* Upload area */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#333] rounded-lg p-4 text-center cursor-pointer hover:border-[#5E6AD2] hover:bg-[#5E6AD2]/5 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-xs text-[#5E6AD2]">Uploading...</p>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload size={16} className="text-[#555]" />
            <p className="text-xs text-[#666]">Drop files or click to upload</p>
          </div>
        )}
      </div>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {attachments.map((att, i) => {
            const Icon = getFileIcon(att.name);
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-[#111] border border-[#1E1E1E] group">
                <Icon size={14} className="text-[#777] flex-shrink-0" />
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs text-[#CCC] hover:text-[#5E6AD2] truncate min-w-0"
                >
                  {att.name}
                </a>
                {att.size && (
                  <span className="text-[10px] text-[#555] flex-shrink-0">
                    {(att.size / 1024).toFixed(0)} KB
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                  className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-[#F87171] transition-all flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}