import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { differenceInDays, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const base44Service = base44.asServiceRole;

    const today = new Date();
    const warningDays = 7; // Alert if deadline is within 7 days

    // Get all projects with target dates
    const projects = await base44Service.entities.Project.list();
    const users = await base44Service.entities.User.list();

    const alerts = [];

    for (const project of projects) {
      if (!project.target_date) continue;

      const targetDate = parseISO(project.target_date);
      const daysUntilDeadline = differenceInDays(targetDate, today);

      // Only alert if deadline is approaching (within 7 days) and not in the past
      if (daysUntilDeadline > 0 && daysUntilDeadline <= warningDays) {
        const projectLead = users.find(u => u.full_name === project.lead);

        // Check if notification already exists for today
        const existingNotification = await base44Service.entities.Notification.filter({
          user_email: projectLead?.email,
          type: 'deadline',
          issue_title: project.name,
          is_read: false,
        });

        // Only create if notification doesn't already exist
        if (existingNotification.length === 0) {
          const notification = {
            user_email: projectLead?.email || users.find(u => u.role === 'admin')?.email,
            type: 'deadline',
            title: `Deadline Approaching: ${project.name}`,
            message: `Project "${project.name}" is due in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}.`,
            issue_title: project.name,
            action_url: `projects?id=${project.id}`,
            is_read: false,
          };

          await base44Service.entities.Notification.create(notification);

          // Send email alert
          if (projectLead?.email) {
            await base44Service.integrations.Core.SendEmail({
              to: projectLead.email,
              subject: `⏰ Deadline Approaching: ${project.name}`,
              body: `Hi ${projectLead.full_name},\n\nProject "${project.name}" is due in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'} (${project.target_date}).\n\nMake sure all tasks are on track for completion.\n\nBest regards,\nProject Management System`,
            });
          }

          alerts.push({
            projectName: project.name,
            daysUntilDeadline,
            targetDate: project.target_date,
          });
        }
      }
    }

    return Response.json({
      success: true,
      message: `Checked ${projects.length} projects, found ${alerts.length} approaching deadlines`,
      alerts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});