import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== 'create') return Response.json({ success: true });

    const comment = data;
    const commenterName = comment.author_name || comment.author || 'Someone';

    // Handle Issue comments
    if (comment.issue_id) {
      const issues = await base44.asServiceRole.entities.Issue.filter({ id: comment.issue_id });
      const issue = issues[0];
      if (!issue?.assignee || issue.assignee === comment.author) return Response.json({ success: true });

      await base44.asServiceRole.entities.Notification.create({
        user_email: issue.assignee,
        type: 'comment',
        title: 'New Comment',
        message: `${commenterName} commented on: ${issue.title}`,
        issue_id: comment.issue_id,
        issue_title: issue.title,
        action_url: `/MyIssues?issue=${comment.issue_id}`,
        is_read: false
      });

      const users = await base44.asServiceRole.entities.User.filter({ email: issue.assignee });
      const assignee = users[0];
      if (assignee?.notify_comments !== false) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: issue.assignee,
          subject: `New comment on: ${issue.title}`,
          body: `Hi ${assignee?.full_name || issue.assignee},\n\n<strong>${commenterName}</strong> added a comment on issue "<strong>${issue.title}</strong>":\n\n<blockquote>${comment.content}</blockquote>\n\nView it in your project management app.`
        });
      }
    }

    // Handle Task comments
    if (comment.task_id) {
      const tasks = await base44.asServiceRole.entities.Task.filter({ id: comment.task_id });
      const task = tasks[0];
      if (!task?.assignee || task.assignee === comment.author) return Response.json({ success: true });

      await base44.asServiceRole.entities.Notification.create({
        user_email: task.assignee,
        type: 'comment',
        title: 'New Comment on Task',
        message: `${commenterName} commented on task: ${task.title}`,
        is_read: false
      });

      const users = await base44.asServiceRole.entities.User.filter({ email: task.assignee });
      const assignee = users[0];
      if (assignee?.notify_comments !== false) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: task.assignee,
          subject: `New comment on task: ${task.title}`,
          body: `Hi ${assignee?.full_name || task.assignee},\n\n<strong>${commenterName}</strong> added a comment on task "<strong>${task.title}</strong>":\n\n<blockquote>${comment.content}</blockquote>\n\nView it in your project management app.`
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});