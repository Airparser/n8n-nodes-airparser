# Airparser n8n Node

> 🧩 Official n8n Node to interact with [Airparser](https://airparser.com): import documents and extract structured data from emails, PDFs, images, and other documents.

[About](#about)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Resources](#resources)

## About

**Airparser** is a powerful document parsing service that extracts structured data from emails, PDFs, images, and other documents using AI and machine learning.

This official **n8n Node** allows you to:

✅ Import documents into Airparser for parsing  
✅ Automatically trigger workflows when documents are parsed  
✅ Extract structured data and use it in your automation workflows

## Operations

### Airparser Actions

- **Import Document From File**
  - Use when you have a binary file (PDF, image, email attachment, etc.)
  - Example: Send files uploaded to a Google Drive folder to Airparser for data extraction
  - Automatically extracts structured data from the document

- **Import Text/HTML Document**
  - Use when you have HTML pages, email content, or plain text
  - Example: Parse HTML from a website or email body content
  - Perfect for extracting data from web pages or text-based content

### Airparser Trigger

- **Document Parsed**
  - Automatically starts your workflow when a document is parsed in Airparser
  - Receives the extracted data and passes it to the next node
  - Built-in security to protect your webhook

## Credentials

### Airparser API Key

1. Sign in to your [Airparser account](https://app.airparser.com/account)
2. Go to your account settings
3. Copy your **API Key**

In n8n:

- Click **"Add Credential"** and search for **"Airparser API"**
- Paste your API Key

For more information, visit the [Airparser documentation](https://help.airparser.com/).

## Usage

### Airparser Trigger

**Quick Start:**

1. Add the **Airparser Trigger** node to your workflow
2. Select **"Document processed"** as the event
3. Choose the **Inbox** where you want to receive events
4. Activate your workflow

That's it! Your workflow will now automatically run whenever a document is parsed in the selected inbox.

**What happens:**

- When a document is parsed in your Airparser inbox, the trigger receives the extracted data
- The data is automatically passed to the next node in your workflow
- You can use this data in any n8n node (send emails, update databases, create records, etc.)

**Example Use Cases:**

- **Email Notifications**: Send an email notification when an invoice is parsed
- **Data Logging**: Save parsed data to Google Sheets or Airtable
- **CRM Updates**: Create or update records in your CRM when documents are processed
- **Approval Workflows**: Route documents for approval based on parsed data

### Import Document From File

1. Select the **Import Document From File** operation
2. Choose an **Inbox** from the dropdown
3. Enter the **Document File (Binary)** property name (usually "data")
4. Optionally add a custom **Filename** or **Additional Metadata**

**Example workflow:**

- Read a PDF file → Airparser node → Extract data → Use in next steps

### Import Text/HTML Document

1. Select the **Import Text/HTML Document** operation
2. Choose an **Inbox** from the dropdown
3. Enter the **HTML/Text Content** (paste directly or use an expression)
4. Optionally add a custom **Filename** or **Additional Metadata**

**Example workflow:**

- Fetch HTML from a website → Airparser node → Extract data → Process results

## Resources

- [Airparser](https://airparser.com) — Document parsing & data extraction
- [Airparser Documentation](https://help.airparser.com/) — Help and guides
- [n8n](https://n8n.io) — Workflow automation platform
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
