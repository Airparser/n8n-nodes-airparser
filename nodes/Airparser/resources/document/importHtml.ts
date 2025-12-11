import type { INodeProperties, IDataObject, PreSendAction } from 'n8n-workflow';
import { inboxSelect } from '../../shared/descriptions';
import { createMultipartBody } from '../../shared/utils';

// Buffer is available globally in Node.js runtime
declare const Buffer: {
	from(data: string, encoding?: string): Uint8Array;
};

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
	let filename = customFilename || 'document.html';

	// Map supported extensions to their content types
	const extensionContentTypes: Record<string, string> = {
		eml: 'message/rfc822',
		html: 'text/html',
		htm: 'text/html',
		txt: 'text/plain',
	};

	// Extract file extension (lowercase)
	const extensionMatch = filename.match(/\.(\w+)$/);
	const extension = extensionMatch ? extensionMatch[1].toLowerCase() : null;

	// Determine content type based on extension
	let fileContentType: string | undefined;
	if (extension && extensionContentTypes[extension]) {
		// Use the mapped content type for supported extensions (EML, HTML, TXT)
		fileContentType = extensionContentTypes[extension];
	} else {
		// For unknown extensions or no extension, use 'text/html' and add .html extension if not provided
		fileContentType = 'text/html';
		if (!extension) {
			// No extension found, add .html if not already present
			if (!filename.endsWith('.html') && !filename.endsWith('.htm')) {
				filename = `${filename}.html`;
			}
		}
		// If extension exists but is not in our supported list, keep the filename as is but use text/html content type
	}

	// Convert HTML string to Buffer
	const htmlBuffer = Buffer.from(htmlContent, 'utf-8');

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
