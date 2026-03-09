import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (event.type !== 'update') return Response.json({ success: true });

    const issue = data;
    const oldStatus = old_data?.status;

    if (!issue.assignee || issue.status === oldStatus) return Response.json({ success: true });

    const statusLabels = {
      backlog: 'Backlog', todo: 'To Do', in_progress: 'In Progress',
      in_review: 'In Review', done: 'Done', cancelled: 'Cancelled'
    };

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: issue.assignee,
      type: 'status_change',
      title: 'Issue Status Updated',
      message: `Status changed to ${statusLabels[issue.status] || issue.status}: ${issue.title}`,
      issue_id: issue.id,
      issue_title: issue.title,
      action_url: `/MyIssues?issue=${issue.id}`,
      is_read: false
    });

    // Send email
    const users = await base44.asServiceRole.entities.User.filter({ email: issue.assignee });
    const assignee = users[0];
    if (assignee?.notify_status_changes !== false) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: issue.assignee,
        subject: `Issue status changed: ${issue.title}`,
        body: `Hi ${assignee?.full_name || issue.assignee},\n\nThe status of issue "${issue.title}" has been updated to <strong>${statusLabels[issue.status] || issue.status}</strong>.\n\nView it in your project management app.`
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});