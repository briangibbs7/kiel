import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Square, Circle, Type, Trash2, ArrowRight, Minus, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

function WhiteboardCanvas({ whiteboard, onSave }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#5E6AD2");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState(whiteboard?.canvas_data?.paths || []);
  const [currentPath, setCurrentPath] = useState(null);

  useEffect(() => {
    redraw();
  }, [paths]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (path.points.length > 0) {
        ctx.moveTo(path.points[0].x, path.points[0].y);
        path.points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
      }
    });
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    setIsDrawing(true);
    setCurrentPath({ color, strokeWidth, points: [pos] });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentPath) return;
    const pos = getPos(e);
    const updated = { ...currentPath, points: [...currentPath.points, pos] };
    setCurrentPath(updated);

    // Draw live
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pts = updated.points;
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = updated.color;
      ctx.lineWidth = updated.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const prev = pts[pts.length - 2];
      const curr = pts[pts.length - 1];
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentPath) return;
    const newPaths = [...paths, currentPath];
    setPaths(newPaths);
    setCurrentPath(null);
    setIsDrawing(false);
    onSave({ paths: newPaths });
  };

  const handleClear = () => {
    setPaths([]);
    onSave({ paths: [] });
    redraw();
  };

  const handleUndo = () => {
    const newPaths = paths.slice(0, -1);
    setPaths(newPaths);
    onSave({ paths: newPaths });
  };

  const colors = ["#5E6AD2", "#4ADE80", "#F87171", "#FACC15", "#60A5FA", "#A78BFA", "#FB923C", "#22D3EE", "#FFFFFF", "#666666"];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-[#1E1E1E] bg-[#111] flex-wrap">
        <div className="flex gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-white scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="h-5 w-px bg-[#333]" />
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#666]">Size</label>
          <input
            type="range"
            min={1}
            max={20}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-[#666]">{strokeWidth}px</span>
        </div>
        <div className="h-5 w-px bg-[#333]" />
        <button
          onClick={handleUndo}
          disabled={paths.length === 0}
          className="text-xs text-[#999] hover:text-white transition-colors disabled:opacity-40 px-2 py-1 rounded border border-[#333] hover:border-[#555]"
        >
          Undo
        </button>
        <button
          onClick={handleClear}
          disabled={paths.length === 0}
          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40 px-2 py-1 rounded border border-[#333] hover:border-red-500"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden bg-[#0A0A0A] relative">
        <canvas
          ref={canvasRef}
          width={1400}
          height={900}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className="cursor-crosshair"
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
}

export default function ConfluenceWhiteboards() {
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", space_id: "" });
  const queryClient = useQueryClient();

  const { data: whiteboards = [] } = useQuery({
    queryKey: ["whiteboards"],
    queryFn: () => base44.entities.Whiteboard.list("-updated_date"),
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Whiteboard.create(data),
    onSuccess: (wb) => {
      queryClient.invalidateQueries({ queryKey: ["whiteboards"] });
      setShowCreate(false);
      setSelected(wb);
      setForm({ title: "", space_id: "" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, canvas_data }) => base44.entities.Whiteboard.update(id, { canvas_data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whiteboards"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Whiteboard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whiteboards"] });
      setSelected(null);
    },
  });

  const spaceMap = Object.fromEntries(spaces.map((s) => [s.id, s]));

  if (selected) {
    return (
      <div className="h-full flex flex-col bg-[#0D0D0D]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E1E1E] bg-[#111]">
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-[#666] hover:text-white transition-colors px-2 py-1 rounded border border-[#333]"
          >
            ← Back
          </button>
          <h2 className="text-sm font-semibold text-white flex-1">{selected.title}</h2>
          <button
            onClick={() => confirm("Delete this whiteboard?") && deleteMutation.mutate(selected.id)}
            className="text-[#666] hover:text-red-400 transition-colors p-1.5"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <WhiteboardCanvas
            whiteboard={selected}
            onSave={(canvas_data) => saveMutation.mutate({ id: selected.id, canvas_data })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0D0D0D] overflow-auto flex flex-col">
      <div className="p-6 border-b border-[#1E1E1E] flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Whiteboards</h1>
          <p className="text-sm text-[#999] mt-1">Visual collaboration spaces for your team</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Whiteboard
        </Button>
      </div>

      <div className="flex-1 p-6">
        {whiteboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <Palette className="w-16 h-16 mb-4 text-[#333]" />
            <p className="text-white font-semibold mb-1">No whiteboards yet</p>
            <p className="text-sm text-[#666] mb-4">Create a whiteboard to brainstorm visually with your team</p>
            <Button onClick={() => setShowCreate(true)} className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Whiteboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whiteboards.map((wb) => {
              const space = spaceMap[wb.space_id];
              return (
                <div
                  key={wb.id}
                  onClick={() => setSelected(wb)}
                  className="bg-[#111] border border-[#1E1E1E] rounded-lg overflow-hidden hover:border-[#2A2A2A] transition-colors cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="h-36 bg-[#0A0A0A] flex items-center justify-center border-b border-[#1E1E1E] relative">
                    <Palette className="w-10 h-10 text-[#222]" />
                    {wb.canvas_data?.paths?.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-[#555]">{wb.canvas_data.paths.length} strokes</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white text-sm mb-1">{wb.title}</h3>
                    <div className="flex items-center justify-between">
                      {space && <span className="text-xs text-[#5E6AD2]">{space.name}</span>}
                      <span className="text-xs text-[#555]">{format(new Date(wb.updated_date), "MMM d")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>New Whiteboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[#999] mb-1.5 block">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[#111] border-[#333] text-white"
                placeholder="Whiteboard title..."
              />
            </div>
            <div>
              <Label className="text-xs text-[#999] mb-1.5 block">Space (optional)</Label>
              <select
                value={form.space_id}
                onChange={(e) => setForm({ ...form, space_id: e.target.value })}
                className="w-full bg-[#111] border border-[#333] text-white rounded px-3 py-2 text-sm"
              >
                <option value="">No space</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-[#999]">Cancel</Button>
            <Button
              onClick={() => form.title && createMutation.mutate({ title: form.title, space_id: form.space_id || undefined, canvas_data: { paths: [] } })}
              disabled={!form.title || createMutation.isPending}
              className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}