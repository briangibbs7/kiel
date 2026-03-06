import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== 'create') {
      return Response.json({ success: true });
    }

    const comment = data;
    const issue = await base44.asServiceRole.entities.Issue.filter({ id: comment.issue_id });
    
    if (!issue || !issue[0]?.assignee) {
      return Response.json({ success: true });
    }

    const assignee = issue[0].assignee;
    const currentUser = await base44.auth.me();

    // Don't notify if comment is from the assignee
    if (currentUser?.email === assignee) {
      return Response.json({ success: true });
    }

    // Get assignee's settings
    const users = await base44.asServiceRole.entities.User.filter({ email: assignee });
    const assigneeSettings = users[0];

    if (!assigneeSettings?.notify_comments) {
      return Response.json({ success: true });
    }

    await base44.asServiceRole.entities.Notification.create({
      user_email: assignee,
      type: 'comment',
      title: 'New Comment',
      message: `${currentUser?.full_name || 'Someone'} commented on: ${issue[0].title}`,
      issue_id: comment.issue_id,
      issue_title: issue[0].title,
      action_url: `/MyIssues?issue=${comment.issue_id}`,
      is_read: false
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});