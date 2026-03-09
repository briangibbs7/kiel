import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Check tasks due tomorrow
    const tasks = await base44.asServiceRole.entities.Task.list('-created_date', 500);
    const tasksDueTomorrow = tasks.filter(t =>
      t.due_date === tomorrowStr &&
      t.assignee &&
      t.status !== 'done'
    );

    // Check issues due tomorrow
    const issues = await base44.asServiceRole.entities.Issue.list('-created_date', 500);
    const issuesDueTomorrow = issues.filter(i =>
      i.due_date === tomorrowStr &&
      i.assignee &&
      i.status !== 'done' &&
      i.status !== 'cancelled'
    );

    const sent = [];

    for (const task of tasksDueTomorrow) {
      const users = await base44.asServiceRole.entities.User.filter({ email: task.assignee });
      const assignee = users[0];

      await base44.asServiceRole.entities.Notification.create({
        user_email: task.assignee,
        type: 'deadline',
        title: 'Task Due Tomorrow',
        message: `Task "${task.title}" is due tomorrow`,
        is_read: false
      });

      if (assignee?.notify_due_dates !== false) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: task.assignee,
          subject: `Reminder: Task due tomorrow – ${task.title}`,
          body: `Hi ${assignee?.full_name || task.assignee},\n\nThis is a reminder that the task "<strong>${task.title}</strong>" is due <strong>tomorrow (${tomorrowStr})</strong>.\n\nCurrent status: ${task.status}\n\nView it in your project management app.`
        });
        sent.push({ type: 'task', id: task.id, title: task.title });
      }
    }

    for (const issue of issuesDueTomorrow) {
      const users = await base44.asServiceRole.entities.User.filter({ email: issue.assignee });
      const assignee = users[0];

      await base44.asServiceRole.entities.Notification.create({
        user_email: issue.assignee,
        type: 'deadline',
        title: 'Issue Due Tomorrow',
        message: `Issue "${issue.title}" is due tomorrow`,
        issue_id: issue.id,
        issue_title: issue.title,
        is_read: false
      });

      if (assignee?.notify_due_dates !== false) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: issue.assignee,
          subject: `Reminder: Issue due tomorrow – ${issue.title}`,
          body: `Hi ${assignee?.full_name || issue.assignee},\n\nThis is a reminder that the issue "<strong>${issue.title}</strong>" is due <strong>tomorrow (${tomorrowStr})</strong>.\n\nCurrent status: ${issue.status}\n\nView it in your project management app.`
        });
        sent.push({ type: 'issue', id: issue.id, title: issue.title });
      }
    }

    return Response.json({ success: true, reminders_sent: sent.length, items: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});