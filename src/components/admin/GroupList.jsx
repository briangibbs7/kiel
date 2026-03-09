import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GroupModal from "./GroupModal";

export default function GroupList({
  groups,
  projects,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  isLoading,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleCreate = () => {
    setSelectedGroup(null);
    setShowModal(true);
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const handleSubmit = (data) => {
    if (selectedGroup) {
      onUpdateGroup(selectedGroup.id, data);
    } else {
      onCreateGroup(data);
    }
    setShowModal(false);
    setSelectedGroup(null);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">User Groups</h3>
          <p className="text-xs text-[#999] mt-1">
            Organize users by roles and project access
          </p>
        </div>
        <Button
          onClick={handleCreate}
          size="sm"
          className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
        >
          <Plus size={14} className="mr-1" /> New Group
        </Button>
      </div>

      <div className="space-y-2">
        {groups.length === 0 ? (
          <div className="p-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded text-sm text-[#666]">
            No groups yet. Create one to organize user roles and project access.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="p-3 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#252525] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">
                    {group.name}
                  </h4>
                  {group.description && (
                    <p className="text-xs text-[#999] mt-1">
                      {group.description}
                    </p>
                  )}
                  <div className="flex gap-1 flex-wrap mt-2">
                    {group.roles.map((role) => (
                      <span
                        key={role}
                        className="text-[10px] bg-[#252525] text-[#999] px-1.5 py-0.5 rounded"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  {group.project_ids && group.project_ids.length > 0 && (
                    <p className="text-[10px] text-[#666] mt-1">
                      {group.project_ids.length} project(s)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <button
                    onClick={() => handleEdit(group)}
                    className="p-1.5 text-[#666] hover:text-white hover:bg-[#252525] rounded transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete group "${group.name}"? Users will not be affected.`
                        )
                      ) {
                        onDeleteGroup(group.id);
                      }
                    }}
                    className="p-1.5 text-[#666] hover:text-[#F87171] hover:bg-[#252525] rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <GroupModal
        open={showModal}
        onOpenChange={setShowModal}
        group={selectedGroup}
        projects={projects}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}