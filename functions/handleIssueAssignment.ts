import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== 'update') {
      return Response.json({ success: true });
    }

    // Get the user settings
    const userSettings = await base44.auth.me();
    if (!userSettings?.notify_assignments) {
      return Response.json({ success: true });
    }

    const issue = data;
    const oldAssignee = data?.old_data?.assignee;
    
    // Only create notification if assignee changed
    if (issue.assignee && issue.assignee !== oldAssignee) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: issue.assignee,
        type: 'assignment',
        title: 'New Issue Assignment',
        message: `You have been assigned to: ${issue.title}`,
        issue_id: issue.id,
        issue_title: issue.title,
        action_url: `/MyIssues?issue=${issue.id}`,
        is_read: false
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});