import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { getInboxes } from './listSearch/getInboxes';
import { importFileDescription, importFilePreSend } from './resources/document/importFile';
import { importHtmlDescription, importHtmlPreSend } from './resources/document/importHtml';

export class Airparser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Airparser',
		name: 'airparser',
		icon: 'file:../../icons/airparser.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Extract structured data from emails, PDFs, images, and other documents',
		defaults: {
			name: 'Airparser',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'airparserApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
					},
				],
				default: 'document',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Import Document From File',
						value: 'importFile',
						description: 'Import a binary file into an inbox and extract structured data',
						action: 'Import a binary file into an inbox and extract structured data',
						routing: {
							send: {
								preSend: [importFilePreSend],
							},
						},
					},

					{
						name: 'Import Text/HTML Document',
						value: 'importTextHtml',
						description: 'Import a text/html document into an inbox and extract structured data',
						action: 'Import a text html document into an inbox and extract structured data',
						routing: {
							send: {
								preSend: [importHtmlPreSend],
							},
						},
					},
				],
				default: 'importFile',
				displayOptions: { show: { resource: ['document'] } },
			},
			...importFileDescription,
			...importHtmlDescription,
		],
	};

	methods = {
		listSearch: {
			getInboxes,
		},
	};
}
