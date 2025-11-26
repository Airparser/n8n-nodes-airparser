import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
	type INodeExecutionData,
} from 'n8n-workflow';
import { triggerProperties } from './triggerProperties';
import { checkExists, create, deleteWebhook } from './webhooks/documentParsed';
import { getInboxes } from '../Airparser/listSearch/getInboxes';

export class AirparserTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Airparser Trigger',
		name: 'airparserTrigger',
		icon: 'file:../../icons/airparser.svg',
		group: ['trigger'],
		version: 1,
		description: 'Trigger workflow when events occur in Airparser',
		defaults: {
			name: 'Airparser Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'airparserApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				description: 'Select the event to trigger the workflow',
				default: 'doc.parsed',
				options: [
					{ name: 'Document processed', value: 'doc.parsed' },
					// ... more trigger events fo here
				],
			},
			...triggerProperties,
		],
	};

	methods = {
		listSearch: {
			getInboxes,
		},
	};

	webhookMethods = {
		default: {
			checkExists,
			create,
			delete: deleteWebhook,
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const headers = this.getHeaderData();

		// Verify webhook secret if configured
		const webhookSecret = (this.getNodeParameter('webhookSecret', 0) as string | undefined) || '';
		if (webhookSecret) {
			const receivedSecret = headers['x-webhook-secret'] as string | undefined;
			if (receivedSecret !== webhookSecret) {
				return {
					webhookResponse: {
						error: 'Invalid webhook secret',
					},
					noWebhookResponse: false,
				};
			}
		}

		// Return the webhook payload as workflow data
		const returnData: INodeExecutionData[] = [{ json: bodyData }];
		return {
			workflowData: [returnData],
		};
	}
}

// Ensure the class is available as both named and default export for compatibility
export default AirparserTrigger;
