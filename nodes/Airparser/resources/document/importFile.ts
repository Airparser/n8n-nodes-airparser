import type { INodeProperties } from 'n8n-workflow';
import { inboxSelect } from '../../shared/descriptions';

const showOnlyForImportFile = {
	operation: ['importFile'],
};

export const importFileDescription: INodeProperties[] = [
	{
		...inboxSelect,
		displayOptions: { show: showOnlyForImportFile },
	},

	{
		displayName: 'Document File (Binary)',
		description: 'The name of the binary property from a previous node that contains the document file to parse. Enter the property name that holds the binary data (e.g., "data").',
		name: 'fileBinary',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForImportFile },
		// Routing handled manually in preSend as FormData field
	},

	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		displayOptions: { show: showOnlyForImportFile },
		description:
			'Optional custom filename for the document. Include the file extension if possible (e.g., "invoice.pdf"); otherwise, Airparser will auto-detect it. If not provided, the original filename from the binary data will be used.',
		// Routing handled manually in preSend
	},

	{
		displayName: 'Additional Metadata (Optional)',
		name: 'payload',
		type: 'json',
		default: {},
		displayOptions: { show: showOnlyForImportFile },
		description: 'Optional JSON object with additional metadata that will be included in the parsed result. Useful for adding custom fields, external IDs, or linking the document to other systems (e.g., {"orderId": "12345", "customerId": "abc"}).',
		// Routing handled manually in preSend as FormData field
	},
];
