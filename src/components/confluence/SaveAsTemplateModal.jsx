import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "meeting_notes", label: "Meeting Notes" },
  { value: "project_plan", label: "Project Plan" },
  { value: "requirements", label: "Requirements" },
  { value: "decision", label: "Decision" },
  { value: "retrospective", label: "Retrospective" },
  { value: "product_spec", label: "Product Spec" },
  { value: "how_to", label: "How-To" },
  { value: "blank", label: "General" },
];

export default function SaveAsTemplateModal({ open, onClose, pageTitle, pageContent }) {
  const [name, setName] = useState(pageTitle || "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("blank");
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-templates"] });
      onClose();
      setName("");
      setDescription("");
      setCategory("blank");
    },
  });

  const handleSave = () => {
    if (!name.trim()) return;
    saveMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      category,
      content: pageContent || "",
      is_global: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#999] -mt-2">Save this page's structure so it can be reused when creating new pages.</p>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-[#999] mb-1.5 block">Template Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Standup Notes"
              className="bg-[#111] border-[#333] text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-[#999] mb-1.5 block">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe when to use this template..."
              rows={2}
              className="bg-[#111] border-[#333] text-white resize-none"
            />
          </div>
          <div>
            <Label className="text-xs text-[#999] mb-1.5 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#111] border-[#333] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-white focus:bg-[#252525]">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#252525] mt-2">
          <Button variant="ghost" onClick={onClose} className="text-[#999]">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveMutation.isPending}
            className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
          >
            {saveMutation.isPending ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}