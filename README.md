# Airparser n8n Node

> 🧩 Official n8n Node to interact with [Airparser](https://airparser.com): import documents and extract structured data from emails, PDFs, images, and other documents.

[About](#about)  
[Operations](#operations)  
[Credentials](#credentials)  
[Resources](#resources)

## About

**Airparser** is a powerful document parsing service that extracts structured data from emails, PDFs, images, and other documents using AI and machine learning.

This official **n8n Node** allows you to:

✅ Import binary files (PDF, images, emails, etc.) into an Airparser inbox  
✅ Import HTML or text content directly into an Airparser inbox  
✅ Extract structured data from documents automatically  
✅ Add custom metadata to link documents to external systems

## Operations

### Document Operations

- **Import Document From File**
  - Upload a binary file (PDF, image, email, etc.) into an Airparser inbox
  - Supports custom filename and additional metadata
  - Works seamlessly with binary data from previous n8n nodes

- **Import Text/HTML Document**
  - Upload HTML or text content directly into an Airparser inbox
  - Supports custom filename and additional metadata
  - Perfect for parsing web content or text-based documents

## Credentials

### Airparser API Key

To connect n8n with your Airparser account, you'll need an **API Key**.

1. Sign in to your [Airparser account](https://app.airparser.com/account)
2. Navigate to your account settings
3. Copy your **API Key**

In n8n:

- Click **"Add Credential"** and search for **"Airparser API"**
- Paste your API Key into the **Airparser API Key** field

For more information, visit the [Airparser documentation](https://help.airparser.com/).

## Usage

### Import Document From File

1. Select the **Import Document From File** operation
2. Choose an **Inbox** from the dropdown (or search for it)
3. Enter the **Document File (Binary)** property name from a previous node (e.g., "data")
4. Optionally specify a custom **Filename** (include the file extension if possible)
5. Optionally add **Additional Metadata** as a JSON object (e.g., `{"orderId": "12345", "customerId": "abc"}`)

**Example workflow:**

- Use a "Read Binary File" node to read a PDF
- Connect it to the Airparser node
- Set "Document File (Binary)" to "data" (or the property name from the previous node)
- Airparser will extract structured data from the document

### Import Text/HTML Document

1. Select the **Import Text/HTML Document** operation
2. Choose an **Inbox** from the dropdown (or search for it)
3. Enter the **HTML/Text Content** (you can paste HTML directly or use an expression)
4. Optionally specify a custom **Filename** (include the file extension if possible)
5. Optionally add **Additional Metadata** as a JSON object

**Example workflow:**

- Use an HTTP Request node to fetch HTML content
- Connect it to the Airparser node
- Use an expression like `{{$json.body}}` to pass the HTML content
- Airparser will extract structured data from the HTML

## Resources

- [Airparser](https://airparser.com) — Document parsing & data extraction
- [Airparser Documentation](https://help.airparser.com/) — Help and guides
- [n8n](https://n8n.io) — Workflow automation platform
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
