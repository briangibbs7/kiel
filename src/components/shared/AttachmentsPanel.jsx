import React, { useRef, useState } from "react";
import { Paperclip, Upload, X, FileText, Image, File, LayoutGrid, List, ZoomIn } from "lucide-react";

function getFileIcon(name) {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return Image;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText;
  return File;
}

function isImage(name) {
  const ext = name?.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPanel({ attachments = [], onUpload, onRemove, uploading }) {
  const inputRef = useRef(null);
  const [viewMode, setViewMode] = useState("gallery");
  const [lightbox, setLightbox] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onUpload(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-xs font-semibold text-[#999] uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip size={12} />
          Attachments {attachments.length > 0 && <span className="text-[#555]">({attachments.length})</span>}
        </h5>
        {attachments.length > 0 && (
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#252525] rounded p-0.5">
            <button
              onClick={() => setViewMode("gallery")}
              className={`p-1 rounded transition-colors ${viewMode === "gallery" ? "bg-[#333] text-white" : "text-[#555] hover:text-[#999]"}`}
            >
              <LayoutGrid size={11} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded transition-colors ${viewMode === "list" ? "bg-[#333] text-white" : "text-[#555] hover:text-[#999]"}`}
            >
              <List size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors mb-3 ${
          dragOver
            ? "border-[#5E6AD2] bg-[#5E6AD2]/10"
            : "border-[#333] hover:border-[#5E6AD2] hover:bg-[#5E6AD2]/5"
        }`}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
        {uploading ? (
          <p className="text-xs text-[#5E6AD2] animate-pulse">Uploading...</p>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Upload size={13} className="text-[#555]" />
            <p className="text-xs text-[#666]">Drop files or click to upload</p>
          </div>
        )}
      </div>

      {/* Gallery view */}
      {attachments.length > 0 && viewMode === "gallery" && (
        <div className="grid grid-cols-3 gap-2">
          {attachments.map((att, i) => {
            const img = isImage(att.name);
            const Icon = getFileIcon(att.name);
            return (
              <div key={i} className="group relative rounded-lg overflow-hidden border border-[#1E1E1E] bg-[#111] aspect-square flex items-center justify-center">
                {img ? (
                  <>
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setLightbox(att)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <ZoomIn size={16} className="text-white" />
                    </button>
                  </>
                ) : (
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-2 w-full h-full justify-center hover:bg-[#161616] transition-colors">
                    <Icon size={22} className="text-[#555]" />
                    <span className="text-[9px] text-[#666] text-center truncate w-full px-1">{att.name}</span>
                  </a>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded p-0.5 text-[#aaa] hover:text-[#F87171]"
                >
                  <X size={10} />
                </button>
                {img && (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-[#ccc] truncate px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {att.name}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {attachments.length > 0 && viewMode === "list" && (
        <div className="space-y-1.5">
          {attachments.map((att, i) => {
            const Icon = getFileIcon(att.name);
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-[#111] border border-[#1E1E1E] group">
                <Icon size={14} className="text-[#777] flex-shrink-0" />
                <a href={att.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-xs text-[#CCC] hover:text-[#5E6AD2] truncate min-w-0">
                  {att.name}
                </a>
                {att.size && <span className="text-[10px] text-[#555] flex-shrink-0">{formatBytes(att.size)}</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-[#F87171] transition-all flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/50 text-sm">{lightbox.name}</p>
        </div>
      )}
    </div>
  );
}