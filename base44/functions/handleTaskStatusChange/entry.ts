import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (event.type !== 'update') return Response.json({ success: true });

    const task = data;
    const oldStatus = old_data?.status;

    if (!task.assignee || task.status === oldStatus) return Response.json({ success: true });

    const statusLabels = {
      todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done'
    };

    await base44.asServiceRole.entities.Notification.create({
      user_email: task.assignee,
      type: 'status_change',
      title: 'Task Status Updated',
      message: `Task "${task.title}" status changed to ${statusLabels[task.status] || task.status}`,
      is_read: false
    });

    const users = await base44.asServiceRole.entities.User.filter({ email: task.assignee });
    const assignee = users[0];
    if (assignee?.notify_status_changes !== false) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: task.assignee,
        subject: `Task status changed: ${task.title}`,
        body: `Hi ${assignee?.full_name || task.assignee},\n\nThe task "<strong>${task.title}</strong>" status has been updated to <strong>${statusLabels[task.status] || task.status}</strong>.\n\nView it in your project management app.`
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});