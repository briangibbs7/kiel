import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Image, MessageSquare, Send, History } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { usePagePresence } from "@/hooks/usePagePresence";
import PresenceAvatars from "@/components/confluence/PresenceAvatars";
import InlineCommentPanel from "@/components/confluence/InlineCommentPanel";
import VersionHistoryPanel from "@/components/confluence/VersionHistoryPanel";

export default function PageEditor({ page, spaceId, onSave, onCancel }) {
  const [title, setTitle] = useState(page?.title || "");
  const [content, setContent] = useState(page?.content || "");
  const [status, setStatus] = useState(page?.status || "draft");
  const [labels, setLabels] = useState(page?.labels?.join(", ") || "");
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Inline comment bubble state
  const [bubble, setBubble] = useState(null); // { x, y, text, range }
  const [newCommentText, setNewCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  const quillRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const presenceUsers = usePagePresence(page?.id, user);

  useEffect(() => {
    if (page) {
      setTitle(page.title || "");
      setContent(page.content || "");
      setStatus(page.status || "draft");
      setLabels(page.labels?.join(", ") || "");
    }
  }, [page?.id]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let savedPage;
      if (page) {
        savedPage = await base44.entities.Page.update(page.id, data);
        // Snapshot a version
        const existingVersions = await base44.entities.PageVersion.filter({ page_id: page.id });
        const nextVersionNumber = existingVersions.length > 0
          ? Math.max(...existingVersions.map((v) => v.version_number)) + 1
          : 1;
        await base44.entities.PageVersion.create({
          page_id: page.id,
          version_number: nextVersionNumber,
          content: data.content,
          title: data.title,
          author: user?.email || "unknown",
        });
      } else {
        savedPage = await base44.entities.Page.create(data);
      }
      return savedPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", spaceId] });
      queryClient.invalidateQueries({ queryKey: ["page-versions", page?.id] });
      onSave();
    },
  });

  const handleRevert = async (version) => {
    if (!page || !confirm(`Revert to version ${version.version_number}? This will overwrite the current content.`)) return;
    setContent(version.content);
    setTitle(version.title);
    setShowHistory(false);
  };

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.PageComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inline-comments", page?.id] });
      setNewCommentText("");
      setBubble(null);
      setShowCommentInput(false);
      setShowComments(true);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      title,
      content,
      space_id: spaceId,
      status,
      labels: labels ? labels.split(",").map((l) => l.trim()).filter(Boolean) : [],
    });
  };

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, "image", file_url);
        }
      }
    };
    input.click();
  };

  // Detect text selection in editor and show comment bubble
  const handleSelectionChange = useCallback(() => {
    if (!page?.id) return; // only for existing pages
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const selection = quill.getSelection();
    if (!selection || selection.length === 0) {
      if (!showCommentInput) setBubble(null);
      return;
    }
    const selectedText = quill.getText(selection.index, selection.length).trim();
    if (!selectedText) return;

    // Get position from DOM selection
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) return;
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    const wrapperRect = editorWrapperRef.current?.getBoundingClientRect();
    if (!wrapperRect) return;

    setBubble({
      x: rect.left - wrapperRect.left + rect.width / 2,
      y: rect.top - wrapperRect.top - 44,
      text: selectedText,
      range: { start: selection.index, end: selection.index + selection.length },
    });
    setShowCommentInput(false);
  }, [page?.id, showCommentInput]);

  const handleSubmitComment = () => {
    if (!newCommentText.trim() || !page?.id) return;
    createCommentMutation.mutate({
      page_id: page.id,
      content: newCommentText.trim(),
      author: user?.email,
      author_name: user?.full_name || user?.email,
      inline_position: bubble
        ? { start: bubble.range.start, end: bubble.range.end, text: bubble.text }
        : undefined,
    });
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
    clipboard: { matchVisual: false },
  };

  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "indent", "color", "background",
    "align", "blockquote", "code-block", "link", "image", "video",
  ];

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-[#1E1E1E] p-4 flex items-center gap-4 flex-shrink-0">
        <Input
          placeholder="Page title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent border-none text-2xl font-semibold text-white placeholder-[#666] focus-visible:ring-0"
        />
        <PresenceAvatars users={presenceUsers} />

        {/* Toggle comments panel */}
        {page?.id && (
          <button
            onClick={() => { setShowComments((v) => !v); setShowHistory(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              showComments ? "bg-[#5E6AD2] text-white" : "border border-[#333] text-[#999] hover:text-white hover:border-[#555]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments
          </button>
        )}

        {/* Toggle version history panel */}
        {page?.id && (
          <button
            onClick={() => { setShowHistory((v) => !v); setShowComments(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              showHistory ? "bg-[#5E6AD2] text-white" : "border border-[#333] text-[#999] hover:text-white hover:border-[#555]"
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        )}

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32 bg-[#1A1A1A] border-[#333] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#333]">
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleSave}
          disabled={!title || saveMutation.isPending}
          className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
        <Button onClick={onCancel} variant="ghost" className="text-[#999]">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Labels */}
      <div className="px-4 py-2 border-b border-[#1E1E1E]">
        <Input
          placeholder="Labels (comma separated)..."
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          className="bg-[#1A1A1A] border-[#333] text-white placeholder-[#666] text-sm"
        />
      </div>

      {/* Image Upload */}
      <div className="px-4 py-2 border-b border-[#1E1E1E]">
        <Button onClick={handleImageUpload} variant="outline" size="sm" className="border-[#333] text-[#999]">
          <Image className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      {/* Editor + Comments panel */}
      <div className="flex-1 overflow-hidden flex">
        {/* Editor area */}
        <div className="flex-1 overflow-hidden flex flex-col relative" ref={editorWrapperRef}>
          <style>{`
            .ql-container { font-family: inherit; font-size: 15px; }
            .ql-editor { padding: 24px; min-height: 100%; color: #E5E5E5; background-color: #0D0D0D; }
            .ql-editor.ql-blank::before { color: #666; font-style: normal; }
            .ql-toolbar { background-color: #1A1A1A; border: none; border-bottom: 1px solid #1E1E1E; padding: 12px; }
            .ql-stroke { stroke: #999; }
            .ql-fill { fill: #999; }
            .ql-picker-label { color: #999; }
            .ql-toolbar button:hover .ql-stroke, .ql-toolbar button.ql-active .ql-stroke { stroke: #5E6AD2; }
            .ql-toolbar button:hover .ql-fill, .ql-toolbar button.ql-active .ql-fill { fill: #5E6AD2; }
            .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: #fff; }
            .ql-editor a { color: #5E6AD2; }
            .ql-editor blockquote { border-left-color: #5E6AD2; color: #CCC; }
            .ql-editor pre { background-color: #1A1A1A; color: #E5E5E5; border: 1px solid #333; }
            .ql-container { border: none; background-color: #0D0D0D; }
            .ql-snow .ql-picker { color: #999; }
            .ql-snow .ql-picker-options { background-color: #1A1A1A; border: 1px solid #333; }
            .ql-snow .ql-picker-item:hover { color: #5E6AD2; }
            .inline-comment-highlight { background-color: rgba(94, 106, 210, 0.25); border-bottom: 2px solid #5E6AD2; cursor: pointer; }
          `}</style>

          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            onChangeSelection={handleSelectionChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing your page content..."
            className="flex-1 flex flex-col"
          />

          {/* Floating comment bubble */}
          {bubble && page?.id && (
            <div
              className="absolute z-30 flex flex-col items-center"
              style={{ left: bubble.x, top: Math.max(4, bubble.y), transform: "translateX(-50%)" }}
            >
              {!showCommentInput ? (
                <button
                  onMouseDown={(e) => { e.preventDefault(); setShowCommentInput(true); }}
                  className="flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white text-xs px-3 py-1.5 rounded-full shadow-lg transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comment
                </button>
              ) : (
                <div className="bg-[#1A1A1A] border border-[#333] rounded-lg shadow-xl w-72 p-3">
                  <p className="text-xs text-[#5E6AD2] italic mb-2 line-clamp-2">
                    "{bubble.text}"
                  </p>
                  <textarea
                    autoFocus
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); }
                      if (e.key === "Escape") { setBubble(null); setShowCommentInput(false); }
                    }}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded px-2 py-1.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#5E6AD2] resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => { setBubble(null); setShowCommentInput(false); setNewCommentText(""); }}
                      className="text-xs text-[#666] hover:text-white px-2 py-1 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newCommentText.trim() || createCommentMutation.isPending}
                      className="flex items-center gap-1 text-xs bg-[#5E6AD2] hover:bg-[#6E7AE2] disabled:opacity-40 text-white px-3 py-1 rounded transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments panel */}
        {showComments && page?.id && (
          <InlineCommentPanel
            pageId={page.id}
            user={user}
            onClose={() => setShowComments(false)}
          />
        )}

        {/* Version history panel */}
        {showHistory && page?.id && (
          <VersionHistoryPanel
            pageId={page.id}
            currentContent={content}
            currentTitle={title}
            onRevert={handleRevert}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>
    </div>
  );
}