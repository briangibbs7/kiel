import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, task_id, subtask_id, issue_id, author, author_name, mentioned_users } = await req.json();

    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    // Create the comment
    const commentData = {
      content,
      author: author || user.email,
      author_name: author_name || user.full_name,
      mentioned_users: mentioned_users || [],
    };

    if (task_id) commentData.task_id = task_id;
    if (subtask_id) commentData.subtask_id = subtask_id;
    if (issue_id) commentData.issue_id = issue_id;

    const comment = await base44.entities.Comment.create(commentData);

    // Create notifications for mentioned users
    if (mentioned_users && mentioned_users.length > 0) {
      const itemType = task_id ? 'task' : subtask_id ? 'subtask' : 'issue';
      const itemId = task_id || subtask_id || issue_id;

      for (const mentionedEmail of mentioned_users) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: mentionedEmail,
          type: 'mention',
          title: `${user.full_name} mentioned you`,
          message: `${content.substring(0, 100)}...`,
          issue_id: issue_id,
          task_id: task_id,
          subtask_id: subtask_id,
          action_url: `/task/${itemId}`,
          is_read: false,
        });
      }
    }

    return Response.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});