import type { INodeProperties, IDataObject, PreSendAction } from 'n8n-workflow';
import { inboxSelect } from '../../shared/descriptions';
import { createMultipartBody } from '../../shared/utils';

const showOnlyForImportFileSync = {
	operation: ['importFileSync'],
};

export const importFileSyncDescription: INodeProperties[] = [
	{
		...inboxSelect,
		displayOptions: { show: showOnlyForImportFileSync },
	},

	{
		displayName: 'Document File (Binary)',
		description:
			'The name of the binary property from a previous node that contains the document file to parse. Enter the property name that holds the binary data (e.g., "data").',
		name: 'fileBinary',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: { show: showOnlyForImportFileSync },
	},

	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		displayOptions: { show: showOnlyForImportFileSync },
		description:
			'Optional custom filename for the document. Include the file extension if possible (e.g., "invoice.pdf"); otherwise, Airparser will auto-detect it. If not provided, the original filename from the binary data will be used.',
	},

	{
		displayName: 'Additional Metadata (Optional)',
		name: 'payload',
		type: 'json',
		default: {},
		displayOptions: { show: showOnlyForImportFileSync },
		description:
			'Optional JSON object with additional metadata that will be included in the parsed result. Useful for adding custom fields, external IDs, or linking the document to other systems (e.g., {"orderId": "12345", "customerId": "abc"}).',
	},
];

export const importFileSyncPreSend: PreSendAction = async function (this, requestOptions) {
	// Get inbox ID from resourceLocator
	const inboxParam = this.getNodeParameter('inbox', 0) as
		| { __rl: true; value: string }
		| { value: string }
		| string;
	const inboxId = typeof inboxParam === 'string' ? inboxParam : inboxParam?.value || '';

	// Build URL with inbox ID (sync endpoint)
	requestOptions.method = 'POST';
	requestOptions.url = `https://api.airparser.com/inboxes/${inboxId}/upload-sync/n8n`;

	const fileBinaryProperty = this.getNodeParameter('fileBinary') as string;

	// Get binary data metadata (fileName, mimeType, etc.)
	const binaryMetadata = this.helpers.assertBinaryData(fileBinaryProperty, 0);
	// Get the actual buffer (await the promise)
	const binaryBuffer = await this.helpers.getBinaryDataBuffer(fileBinaryProperty, 0);

	// Get payload if provided
	const payload = this.getNodeParameter('payload', 0, {}) as IDataObject;

	// Get custom filename if provided
	const customFilename = (this.getNodeParameter('filename', 0) as string | undefined) || '';

	// Determine filename: custom > binary metadata > default
	const filename = customFilename || binaryMetadata.fileName || 'document';

	// Build additional fields for multipart body
	const additionalFields: Record<string, string> = {};
	if (Object.keys(payload).length > 0) {
		additionalFields.payload = JSON.stringify(payload);
	}

	// Create multipart/form-data body manually
	const { body, contentType } = createMultipartBody(
		{
			value: binaryBuffer,
			filename,
			contentType: binaryMetadata.mimeType,
		},
		Object.keys(additionalFields).length > 0 ? additionalFields : undefined,
	);

	requestOptions.body = body;
	requestOptions.headers = {
		...requestOptions.headers,
		'Content-Type': contentType,
	};

	return requestOptions;
};
