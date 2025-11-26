import type { IHookFunctions } from 'n8n-workflow';
import { airparserApiRequest } from '../../Airparser/shared/transport';

// Generate a random webhook secret
function generateWebhookSecret(): string {
	// Generate a 32-character random string
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let secret = '';
	const length = 32;
	// Generate random string using Math.random
	for (let i = 0; i < length; i++) {
		secret += chars[Math.floor(Math.random() * chars.length)];
	}
	return secret;
}

export async function checkExists(this: IHookFunctions): Promise<boolean> {
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

	// Generate or retrieve webhook secret from static data
	const staticData = this.getWorkflowStaticData('node');
	let webhookSecret = staticData.webhookSecret as string | undefined;
	if (!webhookSecret) {
		webhookSecret = generateWebhookSecret();
		staticData.webhookSecret = webhookSecret;
	}

	const body: {
		hook_url: string;
		inbox_id: string;
		event: string;
		secret: string;
	} = {
		hook_url: webhookUrl,
		inbox_id: inboxId,
		event: event,
		secret: webhookSecret,
	};

	try {
		const response = await airparserApiRequest.call(this, 'POST', `/n8n/subscribe`, {}, body);
		// Store webhook ID in static data for later deletion
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
