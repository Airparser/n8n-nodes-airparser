import type { INodeProperties, IDataObject, PreSendAction } from 'n8n-workflow';
import { inboxSelect } from '../../shared/descriptions';
import { getBufferConstructor, createMultipartBody } from '../../shared/utils';

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
		description:
			'The HTML or text content to parse. You can enter HTML directly or use an expression to reference content from a previous node.',
		name: 'htmlContent',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		default: '',
		required: true,
		displayOptions: { show: showOnlyForImportHtml },
	},

	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		displayOptions: { show: showOnlyForImportHtml },
		description:
			'Optional custom filename for the document. Include the file extension if possible (e.g., "page.html"); otherwise, Airparser will auto-detect it. If not provided, defaults to "document.html".',
	},

	{
		displayName: 'Additional Metadata (Optional)',
		name: 'payload',
		type: 'json',
		default: {},
		displayOptions: { show: showOnlyForImportHtml },
		description:
			'Optional JSON object with additional metadata that will be included in the parsed result. Useful for adding custom fields, external IDs, or linking the document to other systems (e.g., {"orderId": "12345", "customerId": "abc"}).',
	},
];

export const importHtmlPreSend: PreSendAction = async function (this, requestOptions) {
	// Get inbox ID from resourceLocator
	const inboxParam = this.getNodeParameter('inbox', 0) as
		| { __rl: true; value: string }
		| { value: string }
		| string;
	const inboxId = typeof inboxParam === 'string' ? inboxParam : inboxParam?.value || '';

	// Build URL with inbox ID
	requestOptions.method = 'POST';
	requestOptions.url = `https://api.airparser.com/inboxes/${inboxId}/upload/n8n`;

	// Get HTML content
	const htmlContent = this.getNodeParameter('htmlContent') as string;

	// Get payload if provided
	const payload = this.getNodeParameter('payload', 0, {}) as IDataObject;

	// Get custom filename if provided
	const customFilename = (this.getNodeParameter('filename', 0) as string | undefined) || '';

	// Determine filename: custom > default
	const filename = customFilename || 'document.html';

	// Determine content type: only set to 'text/html' if filename has no extension
	// or has a non-text extension
	// Known text extensions that should auto-detect content type
	const knownTextExtensions = ['txt', 'eml'];

	// Extract file extension (lowercase)
	const extensionMatch = filename.match(/\.(\w+)$/);
	const extension = extensionMatch ? extensionMatch[1].toLowerCase() : null;

	// Set contentType to 'text/html' only if:
	// - No extension, OR
	// - Extension exists but is NOT a known text extension
	const fileContentType =
		extension && knownTextExtensions.includes(extension) ? undefined : 'text/html';

	// Convert HTML string to Buffer
	const htmlBuffer = getBufferConstructor().from(htmlContent, 'utf-8');

	// Build additional fields for multipart body (NestJS will parse these from @Body() dto)
	const additionalFields: Record<string, string> = {};
	if (Object.keys(payload).length > 0) {
		for (const [key, value] of Object.entries(payload)) {
			additionalFields[key] = typeof value === 'string' ? value : JSON.stringify(value);
		}
	}

	// Create multipart/form-data body manually
	const { body, contentType } = createMultipartBody(
		{
			value: htmlBuffer,
			filename,
			contentType: fileContentType,
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
