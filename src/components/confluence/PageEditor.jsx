import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Image } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { usePagePresence } from "@/hooks/usePagePresence";
import PresenceAvatars from "@/components/confluence/PresenceAvatars";

export default function PageEditor({ page, spaceId, onSave, onCancel }) {
  const [title, setTitle] = useState(page?.title || "");
  const [content, setContent] = useState(page?.content || "");
  const [status, setStatus] = useState(page?.status || "draft");
  const [labels, setLabels] = useState(page?.labels?.join(", ") || "");
  const quillRef = useRef(null);
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
  }, [page]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (page) {
        return base44.entities.Page.update(page.id, data);
      } else {
        return base44.entities.Page.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", spaceId] });
      onSave();
    },
  });

  const handleSave = () => {
    const data = {
      title,
      content,
      space_id: spaceId,
      status,
      labels: labels ? labels.split(",").map((l) => l.trim()).filter(Boolean) : [],
    };
    saveMutation.mutate(data);
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
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
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
        {/* Live presence */}
        <PresenceAvatars users={presenceUsers} />

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

      {/* Image Upload Button */}
      <div className="px-4 py-2 border-b border-[#1E1E1E]">
        <Button
          onClick={handleImageUpload}
          variant="outline"
          size="sm"
          className="border-[#333] text-[#999]"
        >
          <Image className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <style>{`
          .ql-container {
            font-family: inherit;
            font-size: 15px;
          }
          .ql-editor {
            padding: 24px;
            min-height: 100%;
            color: #E5E5E5;
            background-color: #0D0D0D;
          }
          .ql-editor.ql-blank::before {
            color: #666;
            font-style: normal;
          }
          .ql-toolbar {
            background-color: #1A1A1A;
            border: none;
            border-bottom: 1px solid #1E1E1E;
            padding: 12px;
          }
          .ql-stroke {
            stroke: #999;
          }
          .ql-fill {
            fill: #999;
          }
          .ql-picker-label {
            color: #999;
          }
          .ql-toolbar button:hover .ql-stroke,
          .ql-toolbar button.ql-active .ql-stroke {
            stroke: #5E6AD2;
          }
          .ql-toolbar button:hover .ql-fill,
          .ql-toolbar button.ql-active .ql-fill {
            fill: #5E6AD2;
          }
          .ql-editor h1, .ql-editor h2, .ql-editor h3 {
            color: #fff;
          }
          .ql-editor a {
            color: #5E6AD2;
          }
          .ql-editor blockquote {
            border-left-color: #5E6AD2;
            color: #CCC;
          }
          .ql-editor pre {
            background-color: #1A1A1A;
            color: #E5E5E5;
            border: 1px solid #333;
          }
          .ql-container {
            border: none;
            background-color: #0D0D0D;
          }
          .ql-snow .ql-picker {
            color: #999;
          }
          .ql-snow .ql-picker-options {
            background-color: #1A1A1A;
            border: 1px solid #333;
          }
          .ql-snow .ql-picker-item:hover {
            color: #5E6AD2;
          }
        `}</style>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Start writing your page content..."
          className="flex-1 flex flex-col"
        />
      </div>
    </div>
  );
}