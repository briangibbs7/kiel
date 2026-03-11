import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await req.json();
    
    // Fetch the task
    const task = await base44.entities.Task.get(taskId);
    
    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check permissions: admin or creator
    const canDelete = user.role === 'admin' || task.created_by === user.email;
    
    if (!canDelete) {
      return Response.json({ error: 'Forbidden: You can only delete your own tasks' }, { status: 403 });
    }

    // Delete the task
    await base44.entities.Task.delete(taskId);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});