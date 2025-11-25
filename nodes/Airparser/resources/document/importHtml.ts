import type { INodeProperties } from 'n8n-workflow';
import { inboxSelect } from '../../shared/descriptions';

const showOnlyForImportHtml = {
	operation: ['importTextHtml'],
};

export const importHtmlDescription: INodeProperties[] = [
	{
		...inboxSelect,
		displayOptions: { show: showOnlyForImportHtml },
	},

	{
		displayName: 'HTML/Text Content',
		description: 'The HTML or text content to parse. You can enter HTML directly or use an expression to reference content from a previous node.',
		name: 'htmlContent',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		default: '',
		required: true,
		displayOptions: { show: showOnlyForImportHtml },
		// Routing handled manually in preSend to upload as binary file
	},

	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		displayOptions: { show: showOnlyForImportHtml },
		description:
			'Optional custom filename for the document. Include the file extension if possible (e.g., "page.html"); otherwise, Airparser will auto-detect it. If not provided, defaults to "document.html".',
		// Routing handled manually in preSend
	},

	{
		displayName: 'Additional Metadata (Optional)',
		name: 'payload',
		type: 'json',
		default: {},
		displayOptions: { show: showOnlyForImportHtml },
		description: 'Optional JSON object with additional metadata that will be included in the parsed result. Useful for adding custom fields, external IDs, or linking the document to other systems (e.g., {"orderId": "12345", "customerId": "abc"}).',
		// Routing handled manually in preSend as form fields
	},
];
