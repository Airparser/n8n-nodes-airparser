import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { getInboxes } from './listSearch/getInboxes';
import { importFileDescription, importFilePreSend } from './resources/document/importFile';
import { importHtmlDescription, importHtmlPreSend } from './resources/document/importHtml';
import { importFileSyncDescription, importFileSyncPreSend } from './resources/document/importFileSync';
import { importHtmlSyncDescription, importHtmlSyncPreSend } from './resources/document/importHtmlSync';

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
						name: 'Import File',
						value: 'importFileSync',
						description: 'Import a binary file into an inbox and return extracted data immediately',
						action: 'Import a binary file into an inbox and return extracted data immediately',
						routing: {
							send: {
								preSend: [importFileSyncPreSend],
							},
						},
					},

					{
						name: 'Import Text/HTML',
						value: 'importTextHtmlSync',
						description: 'Import a text/HTML document into an inbox and return extracted data immediately',
						action: 'Import a text html document into an inbox and return extracted data immediately',
						routing: {
							send: {
								preSend: [importHtmlSyncPreSend],
							},
						},
					},

					{
						name: 'Import File (Async)',
						value: 'importFile',
						description: 'Import a binary file into an inbox asynchronously and return the document ID',
						action: 'Import a binary file into an inbox asynchronously and return the document ID',
						routing: {
							send: {
								preSend: [importFilePreSend],
							},
						},
					},

					{
						name: 'Import Text/HTML (Async)',
						value: 'importTextHtml',
						description: 'Import a text/HTML document into an inbox asynchronously and return the document ID',
						action: 'Import a text html document into an inbox asynchronously and return the document ID',
						routing: {
							send: {
								preSend: [importHtmlPreSend],
							},
						},
					},
				],
				default: 'importFileSync',
				displayOptions: { show: { resource: ['document'] } },
			},
			...importFileSyncDescription,
			...importHtmlSyncDescription,
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
