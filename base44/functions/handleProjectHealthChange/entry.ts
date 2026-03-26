import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    const base44Service = base44.asServiceRole;

    // Check if health status changed
    if (old_data?.health === data?.health) {
      return Response.json({ message: 'No health change detected' });
    }

    const project = data;
    const previousHealth = old_data?.health || 'on_track';
    const currentHealth = project.health;

    // Only notify on transitions to at_risk or off_track
    if (currentHealth !== 'at_risk' && currentHealth !== 'off_track') {
      return Response.json({ message: 'Health change does not require notification' });
    }

    // Get project lead and team members
    const users = await base44Service.entities.User.list();
    const projectLead = users.find(u => u.full_name === project.lead);

    // Create notifications for project lead and admins
    const notificationData = {
      user_email: projectLead?.email || users.find(u => u.role === 'admin')?.email,
      type: 'status_change',
      title: `Project Health Alert: ${project.name}`,
      message: `Project "${project.name}" health has shifted from ${previousHealth.replace('_', ' ')} to ${currentHealth.replace('_', ' ')}.`,
      action_url: `projects?id=${project.id}`,
      is_read: false,
    };

    // Create notification in database
    await base44Service.entities.Notification.create(notificationData);

    // Send email to project lead
    if (projectLead?.email) {
      await base44Service.integrations.Core.SendEmail({
        to: projectLead.email,
        subject: `🚨 Project Health Alert: ${project.name}`,
        body: `Hi ${projectLead.full_name},\n\nProject "${project.name}" health has changed from ${previousHealth.replace('_', ' ')} to ${currentHealth.replace('_', ' ')}.\n\nPlease review the project status and take necessary actions.\n\nBest regards,\nProject Management System`,
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Health change notification sent',
      projectName: project.name,
      healthChange: `${previousHealth} -> ${currentHealth}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});