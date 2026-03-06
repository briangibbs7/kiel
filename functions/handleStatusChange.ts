import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== 'update') {
      return Response.json({ success: true });
    }

    const issue = data;
    const oldStatus = data?.old_data?.status;

    // Only notify if status actually changed
    if (!issue.assignee || issue.status === oldStatus) {
      return Response.json({ success: true });
    }

    // Get assignee's settings
    const users = await base44.asServiceRole.entities.User.filter({ email: issue.assignee });
    const assigneeSettings = users[0];
    
    if (!assigneeSettings?.notify_status_changes) {
      return Response.json({ success: true });
    }

    const statusLabels = {
      backlog: 'Backlog',
      todo: 'To Do',
      in_progress: 'In Progress',
      in_review: 'In Review',
      done: 'Done',
      cancelled: 'Cancelled'
    };

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

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});