import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to_user, content } = await req.json();

    if (!to_user || !content) {
      return Response.json(
        { error: 'to_user and content are required' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await base44.entities.Message.create({
      from_user: user.email,
      from_user_name: user.full_name,
      to_user,
      content,
      is_read: false,
    });

    return Response.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});