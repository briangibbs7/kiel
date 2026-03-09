import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { event_type, entity_type, entity_id, old_data, data } = payload;

    if (event_type !== 'update' || !data?.status || data.status === old_data?.status) {
      return Response.json({ success: false, reason: 'Not a status change' });
    }

    // Fetch all automations
    const automations = await base44.asServiceRole.entities.Automation.list();
    
    // Filter relevant automations
    const relevantAutomations = automations.filter(auto => {
      if (!auto.is_active) return false;
      if (auto.trigger_type !== 'status_change') return false;
      
      const trigger = auto.trigger_config;
      if (trigger.entity_type !== entity_type) return false;
      if (trigger.to_status && trigger.to_status !== data.status) return false;
      if (trigger.from_status && trigger.from_status !== old_data?.status) return false;
      
      return true;
    });

    // Execute actions for each automation
    for (const automation of relevantAutomations) {
      for (const action of automation.actions) {
        await executeAction(base44, action, { entity_type, entity_id, data, old_data });
      }
    }

    return Response.json({ success: true, automationsTriggered: relevantAutomations.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function executeAction(base44, action, context) {
  const { entity_type, entity_id, data, old_data } = context;

  switch (action.type) {
    case 'notify_reporter': {
      // Fetch the entity to get reporter info
      const entity = await base44.asServiceRole.entities[capitalizeFirst(entity_type)].list().then(items => 
        items.find(i => i.id === entity_id)
      );
      
      if (entity?.created_by) {
        const message = `${entity.title || 'Item'} status changed from ${old_data?.status} to ${data.status}`;
        // Create notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: entity.created_by,
          type: 'status_change',
          title: 'Task Status Updated',
          message,
          action_url: `/project-detail?id=${entity.project_id}`
        });
      }
      break;
    }

    case 'update_epic_health': {
      if (entity_type === 'task' && data.epic_id) {
        // Fetch all tasks in the epic
        const epicTasks = await base44.asServiceRole.entities.Task.filter({ epic_id: data.epic_id });
        
        const total = epicTasks.length;
        const done = epicTasks.filter(t => t.status === 'done').length;
        const inProgress = epicTasks.filter(t => t.status === 'in_progress').length;

        let health = 'on_track';
        if (done / total >= 0.8) {
          health = 'on_track';
        } else if (done / total >= 0.5 && inProgress > 0) {
          health = 'on_track';
        } else if (done / total < 0.3) {
          health = 'at_risk';
        }

        await base44.asServiceRole.entities.Epic.update(data.epic_id, { health });
      }
      break;
    }

    case 'notify_user': {
      if (action.config?.user_email) {
        const message = action.config.message || `Status changed to ${data.status}`;
        await base44.asServiceRole.entities.Notification.create({
          user_email: action.config.user_email,
          type: 'status_change',
          title: action.config.title || 'Status Updated',
          message,
          action_url: action.config.action_url
        });
      }
      break;
    }

    case 'send_email': {
      if (action.config?.to_email) {
        await base44.integrations.Core.SendEmail({
          to: action.config.to_email,
          subject: action.config.subject || 'Status Update',
          body: action.config.body || `Item status changed to ${data.status}`
        });
      }
      break;
    }

    case 'update_field': {
      const updatePayload = {};
      for (const [key, value] of Object.entries(action.config?.fields || {})) {
        updatePayload[key] = value;
      }
      
      if (Object.keys(updatePayload).length > 0) {
        await base44.asServiceRole.entities[capitalizeFirst(entity_type)].update(entity_id, updatePayload);
      }
      break;
    }
  }
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}