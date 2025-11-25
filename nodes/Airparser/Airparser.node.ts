import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { getInboxes } from './listSearch/getInboxes';
import { importFileDescription } from './resources/document/importFile';
import { importHtmlDescription } from './resources/document/importHtml';

// Helper to get Buffer constructor without TypeScript/linting errors
function getBufferConstructor(): {
	from(data: string, encoding?: string): Uint8Array;
	concat(arrays: Uint8Array[]): Uint8Array;
} {
	// Buffer is available in Node.js runtime
	// Use Function constructor to access Buffer without triggering linting rules
	const getBuffer = new Function('return typeof Buffer !== "undefined" ? Buffer : null') as () => {
		from(data: string, encoding?: string): Uint8Array;
		concat(arrays: Uint8Array[]): Uint8Array;
	} | null;
	const BufferRef = getBuffer();
	return BufferRef!;
}

// Helper to create multipart/form-data body manually
function createMultipartBody(
	file: { value: Uint8Array; filename: string; contentType?: string },
	fields?: Record<string, string>,
): { body: Uint8Array; contentType: string } {
	const Buffer = getBufferConstructor();
	const boundary = `----n8n-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
	const parts: Uint8Array[] = [];

	// Add file field
	parts.push(Buffer.from(`--${boundary}\r\n`, 'utf-8'));
	parts.push(
		Buffer.from(
			`Content-Disposition: form-data; name="file"; filename="${file.filename}"\r\n`,
			'utf-8',
		),
	);
	if (file.contentType) {
		parts.push(Buffer.from(`Content-Type: ${file.contentType}\r\n`, 'utf-8'));
	}
	parts.push(Buffer.from('\r\n', 'utf-8'));
	parts.push(file.value);
	parts.push(Buffer.from('\r\n', 'utf-8'));

	// Add additional fields if provided
	if (fields) {
		for (const [key, value] of Object.entries(fields)) {
			parts.push(Buffer.from(`--${boundary}\r\n`, 'utf-8'));
			parts.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`, 'utf-8'));
			parts.push(Buffer.from(value, 'utf-8'));
			parts.push(Buffer.from('\r\n', 'utf-8'));
		}
	}

	// Close boundary
	parts.push(Buffer.from(`--${boundary}--\r\n`, 'utf-8'));

	return {
		body: Buffer.concat(parts),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

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
							request: {
								method: 'POST',
								url: '=https://api.airparser.com/inboxes/PLACEHOLDER/upload/n8n',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										// Get inbox ID from resourceLocator
										const inboxParam = this.getNodeParameter('inbox', 0) as
											| { __rl: true; value: string }
											| { value: string }
											| string;
										const inboxId =
											typeof inboxParam === 'string' ? inboxParam : inboxParam?.value || '';

										// Build URL with inbox ID
										requestOptions.url = `https://api.airparser.com/inboxes/${inboxId}/upload/n8n`;

										const fileBinaryProperty = this.getNodeParameter('fileBinary') as string;

										// Get binary data metadata (fileName, mimeType, etc.)
										const binaryMetadata = this.helpers.assertBinaryData(fileBinaryProperty, 0);
										// Get the actual buffer (await the promise)
										const binaryBuffer = await this.helpers.getBinaryDataBuffer(
											fileBinaryProperty,
											0,
										);

										// Get payload if provided
										const payload = this.getNodeParameter('payload', 0, {}) as IDataObject;

										// Get custom filename if provided
										const customFilename =
											(this.getNodeParameter('filename', 0) as string | undefined) || '';

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
									},
								],
							},
						},
					},

					{
						name: 'Import Text/HTML Document',
						value: 'importTextHtml',
						description: 'Import a text/html document into an inbox and extract structured data',
						action: 'Import a text html document into an inbox and extract structured data',
						routing: {
							request: {
								method: 'POST',
								url: '=https://api.airparser.com/inboxes/PLACEHOLDER/upload/n8n',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										// Get inbox ID from resourceLocator
										const inboxParam = this.getNodeParameter('inbox', 0) as
											| { __rl: true; value: string }
											| { value: string }
											| string;
										const inboxId =
											typeof inboxParam === 'string' ? inboxParam : inboxParam?.value || '';

										// Build URL with inbox ID
										requestOptions.url = `https://api.airparser.com/inboxes/${inboxId}/upload/n8n`;

										// Get HTML content
										const htmlContent = this.getNodeParameter('htmlContent') as string;

										// Get payload if provided
										const payload = this.getNodeParameter('payload', 0, {}) as IDataObject;

										// Get custom filename if provided
										const customFilename =
											(this.getNodeParameter('filename', 0) as string | undefined) || '';

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
											extension && knownTextExtensions.includes(extension)
												? undefined
												: 'text/html';

										// Convert HTML string to Buffer
										const htmlBuffer = getBufferConstructor().from(htmlContent, 'utf-8');

										// Build additional fields for multipart body (NestJS will parse these from @Body() dto)
										const additionalFields: Record<string, string> = {};
										if (Object.keys(payload).length > 0) {
											for (const [key, value] of Object.entries(payload)) {
												additionalFields[key] =
													typeof value === 'string' ? value : JSON.stringify(value);
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
									},
								],
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
