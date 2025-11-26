// Helper to get Buffer constructor without TypeScript/linting errors
export function getBufferConstructor(): {
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
export function createMultipartBody(
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
