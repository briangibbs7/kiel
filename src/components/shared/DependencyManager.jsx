import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Link2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DependencyManager({
  open,
  onClose,
  type,
  currentId,
  availableItems,
  currentDependencies = [],
  onAddDependency,
  onRemoveDependency,
}) {
  const [selected, setSelected] = useState("");
  const [depType, setDepType] = useState("blocks");

  const handleAdd = () => {
    if (!selected) return;
    onAddDependency({ itemId: selected, type: depType });
    setSelected("");
    setDepType("blocks");
  };

  const selectedItem = availableItems.find((i) => i.id === selected);
  const displayName = selectedItem
    ? `${selectedItem.prefix || "#"}-${selectedItem.issue_number || selectedItem.name}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#333] text-[#E5E5E5] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E5E5E5]">Manage Dependencies</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current dependencies */}
          {currentDependencies.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-[#6B6B6B]">Current Dependencies</Label>
              <div className="space-y-1">
                {currentDependencies.map((dep) => {
                  const item = availableItems.find((i) => i.id === dep.itemId);
                  const displayText = item
                    ? `${item.prefix || "#"}-${item.issue_number || item.name}`
                    : "Unknown";
                  return (
                    <div
                      key={dep.itemId}
                      className="flex items-center justify-between text-xs bg-[#111] border border-[#333] rounded px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Link2 size={12} className="text-[#555]" />
                        <span className="text-[#999]">{displayText}</span>
                        <span className="text-[#555]">{dep.type}</span>
                      </div>
                      <button
                        onClick={() => onRemoveDependency(dep.itemId)}
                        className="text-[#555] hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add new dependency */}
          <div className="border-t border-[#333] pt-4 space-y-3">
            <Label className="text-xs text-[#6B6B6B]">Add Dependency</Label>
            <div className="space-y-2">
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm">
                  <SelectValue placeholder={`Select ${type}...`} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {availableItems
                    .filter((i) => i.id !== currentId)
                    .map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        className="text-white focus:bg-[#252525] focus:text-white text-xs"
                      >
                        {item.prefix || "#"}-{item.issue_number || item.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={depType} onValueChange={setDepType}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="blocks" className="text-white focus:bg-[#252525] focus:text-white text-xs">
                    blocks
                  </SelectItem>
                  <SelectItem value="is blocked by" className="text-white focus:bg-[#252525] focus:text-white text-xs">
                    is blocked by
                  </SelectItem>
                  <SelectItem value="relates to" className="text-white focus:bg-[#252525] focus:text-white text-xs">
                    relates to
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAdd}
              disabled={!selected}
              className="w-full bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white text-xs disabled:opacity-50"
            >
              <Plus size={12} className="mr-1" />
              Add Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}