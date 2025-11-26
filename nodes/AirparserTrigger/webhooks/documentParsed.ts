import type { IHookFunctions } from 'n8n-workflow';
import { airparserApiRequest } from '../../Airparser/shared/transport';

export async function checkExists(this: IHookFunctions): Promise<boolean> {
	// const inboxParam = this.getNodeParameter('inbox', 0) as
	// 	| { __rl: true; value: string }
	// 	| { value: string }
	// 	| string;
	// const inboxId = typeof inboxParam === 'string' ? inboxParam : inboxParam?.value || '';

	// const webhookUrl = this.getNodeWebhookUrl('default');
	// if (!webhookUrl) {
	// 	return false;
	// }

	// try {
	// 	const exists = await airparserApiRequest.call(this, 'GET', `/n8n/check-exists`, {
	// 		webhook_url: webhookUrl,
	// 		inbox_id: inboxId,
	// 	});
	// 	// Server returns boolean directly
	// 	return exists === true;
	// } catch (error) {
	// 	// If error, webhook doesn't exist
	// 	return false;
	// }
	const staticData = this.getWorkflowStaticData('node');
	return !!staticData.hookId;
}

export async function create(this: IHookFunctions): Promise<boolean> {
	const inboxParam = this.getNodeParameter('inbox', 0) as
		| { __rl: true; value: string }
		| { value: string }
		| string;
	const inboxId = typeof inboxParam === 'string' ? inboxParam : inboxParam?.value || '';

	const webhookUrl = this.getNodeWebhookUrl('default');
	if (!webhookUrl) {
		throw new Error('Webhook URL is not available');
	}

	const event = (this.getNodeParameter('event', 0) as string | undefined) || 'doc.parsed';

	const body = {
		hook_url: webhookUrl,
		inbox_id: inboxId,
		event: event,
	};

	try {
		const response = await airparserApiRequest.call(this, 'POST', `/n8n/subscribe`, {}, body);
		// Store webhook ID in static data for later deletion
		const staticData = this.getWorkflowStaticData('node');
		if (response && (response as { _id?: string })._id) {
			staticData.hookId = (response as { _id: string })._id;
		}
		return true;
	} catch (error) {
		return false;
	}
}

export async function deleteWebhook(this: IHookFunctions): Promise<boolean> {
	const staticData = this.getWorkflowStaticData('node');
	const webhookId = staticData.hookId;
	if (!webhookId) return true;

	try {
		await airparserApiRequest.call(
			this,
			'DELETE',
			`/n8n/unsubscribe`,
			{},
			{
				hook_id: webhookId,
			},
		);
		return true;
	} catch (error) {
		// If webhook doesn't exist, consider it deleted
		return true;
	}
}
