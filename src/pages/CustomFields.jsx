import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomFields() {
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    field_type: 'text',
    entity_type: 'issue',
    is_required: false,
    options: '',
    description: ''
  });
  const queryClient = useQueryClient();

  const { data: customFields = [] } = useQuery({
    queryKey: ['customFields'],
    queryFn: () => base44.entities.CustomField.list()
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const addFieldMutation = useMutation({
    mutationFn: async (data) => {
      const options = data.field_type.includes('select') && data.options
        ? data.options.split(',').map(o => o.trim())
        : undefined;

      return base44.entities.CustomField.create({
        name: data.name,
        field_type: data.field_type,
        entity_type: data.entity_type,
        is_required: data.is_required,
        options,
        description: data.description,
        created_by: user?.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      resetForm();
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomField.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      field_type: 'text',
      entity_type: 'issue',
      is_required: false,
      options: '',
      description: ''
    });
    setShowForm(false);
    setEditingField(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    addFieldMutation.mutate(formData);
  };

  const groupedFields = customFields.reduce((acc, field) => {
    if (!acc[field.entity_type]) acc[field.entity_type] = [];
    acc[field.entity_type].push(field);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings size={20} />
          Custom Fields
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl">
          {/* Add field form */}
          {showForm && (
            <div className="p-4 bg-[#161616] rounded border border-[#252525] mb-6 space-y-3">
              <Input
                placeholder="Field name (e.g., Department, Budget)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#0D0D0D] border-[#252525]"
              />

              <select
                value={formData.entity_type}
                onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#252525] rounded text-white text-sm"
              >
                <option value="issue">Issue</option>
                <option value="task">Task</option>
                <option value="epic">Epic</option>
              </select>

              <select
                value={formData.field_type}
                onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#252525] rounded text-white text-sm"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select (Single)</option>
                <option value="multiselect">Select (Multiple)</option>
                <option value="date">Date</option>
                <option value="checkbox">Checkbox</option>
              </select>

              {formData.field_type.includes('select') && (
                <Input
                  placeholder="Options (comma-separated: Option1, Option2, Option3)"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="bg-[#0D0D0D] border-[#252525]"
                />
              )}

              <Input
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#0D0D0D] border-[#252525]"
              />

              <label className="flex items-center gap-2 text-sm text-[#999]">
                <input
                  type="checkbox"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  className="w-4 h-4"
                />
                Required field
              </label>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  className="bg-[#5E6AD2] hover:bg-[#6B78E5]"
                >
                  Create Field
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-[#252525]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="gap-2 bg-[#5E6AD2] hover:bg-[#6B78E5] mb-6"
            >
              <Plus size={16} />
              New Custom Field
            </Button>
          )}

          {/* Fields list by entity type */}
          {Object.entries(groupedFields).map(([entityType, fields]) => (
            <div key={entityType} className="mb-6">
              <h2 className="text-sm font-semibold text-white mb-3 capitalize">{entityType} Fields</h2>
              <div className="space-y-2">
                {fields.map(field => (
                  <div key={field.id} className="flex items-center gap-3 p-3 bg-[#161616] rounded border border-[#252525]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{field.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-[#252525] text-[#999] rounded">{field.field_type}</span>
                        {field.is_required && <span className="text-xs text-red-400">*Required</span>}
                      </div>
                      {field.description && <p className="text-xs text-[#999] mt-1">{field.description}</p>}
                      {field.options && <p className="text-xs text-[#555] mt-1">{field.options.join(', ')}</p>}
                    </div>
                    <button
                      onClick={() => deleteFieldMutation.mutate(field.id)}
                      className="p-1 text-[#555] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {customFields.length === 0 && !showForm && (
            <div className="text-center py-8 text-[#555]">
              <p className="text-sm">No custom fields created yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}