import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { message, color, entity_type, entity_id, channel, webhook_url } = payload;

    if (!webhook_url || !message) {
      return Response.json({ error: 'webhook_url and message are required' }, { status: 400 });
    }

    // Build Slack message
    const slackMessage = {
      attachments: [
        {
          color: color || '#5E6AD2',
          fields: [
            {
              title: 'Message',
              value: message,
              short: false,
            },
            {
              title: 'Entity Type',
              value: entity_type || 'N/A',
              short: true,
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true,
            },
          ],
          footer: 'Project Management System',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
        },
      ],
    };

    if (channel) {
      slackMessage.channel = channel;
    }

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { error: `Slack API error: ${error}` },
        { status: response.status }
      );
    }

    return Response.json({ success: true, message: 'Slack notification sent' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});