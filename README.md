# n8n-nodes-tela

This is an n8n community node that provides seamless integration with the Tela API. It allows you to interact with Tela projects and canvases in your n8n workflows, enabling dynamic content generation and workflow automation.

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

## TL;DR

Don't want to read? Import the sample workflow **"Tela Canvas Execution with Dynamic Variables"** to test this node with real Tela API integration.

## What This Node Does

The Tela node enables you to:

- **Execute Tela Canvases**: Run AI-powered canvases with dynamic variables and get results
- **Dynamic Variable Handling**: Automatically detect and configure canvas variables
- **File Upload Support**: Handle file uploads for canvas processing
- **Project Management**: List and manage Tela projects and their canvases
- **Workflow Integration**: Seamlessly integrate Tela AI workflows into your n8n automation

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `@meistrari/n8n-nodes-tela` as the package name
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes
5. Select **Install**

### Manual Installation

For self-hosted n8n instances:

```bash
npm install @meistrari/n8n-nodes-tela
```

For Docker installations, follow the [custom nodes guide](https://docs.n8n.io/integrations/creating-nodes/deploy/install-private-nodes/).

## Configuration

### 1. Create Tela API Credentials

1. Create a new credential of type **"Tela API"**
2. Enter your Tela API key (find this in your [Tela dashboard](https://app.tela.com))
3. Test the connection to verify it works

### 2. Configure the Node

1. **Project**: Select the project containing your canvas
2. **Canvas**: Choose the specific canvas to execute
3. **Variables**: Configure dynamic fields based on your canvas configuration

## Operations

### Execute Canvas

The main operation that runs your Tela canvas with the specified variables and returns the AI-generated results.

**Parameters:**

| Field              | Type    | Required | Description                                                                 |
| ------------------ | ------- | -------- | --------------------------------------------------------------------------- |
| **Project**        | Options | Yes      | Select the project containing your canvas                                   |
| **Canvas**         | Options | Yes      | Select the canvas to execute                                                |
| **Variables**      | Collection | No    | Dynamic fields based on your canvas configuration                           |
| **Async Execution** | Boolean | No      | When enabled, returns immediately with completion ID instead of waiting     |

**Use Cases:**

- Generate dynamic content for emails
- Create personalized marketing materials
- Process documents with AI assistance
- Generate reports based on input data

### Execute Workstation

Create a task in the Tela Workstation dashboard. Tasks are visible in the Tela web interface and can be reviewed, approved, or processed manually.

**Parameters:**

| Field         | Type       | Required | Description                                       |
| ------------- | ---------- | -------- | ------------------------------------------------- |
| **Project**   | Options    | Yes      | Select the project containing your canvas         |
| **Canvas**    | Options    | Yes      | Select the canvas to execute                      |
| **Label**     | String     | No       | Optional label for the workstation task           |
| **Variables** | Collection | No       | Dynamic fields based on your canvas configuration |

**Response:**

- Returns the full API response object

**Use Cases:**

- Create tasks for human review in Tela dashboard
- Queue AI-generated content for approval workflows
- Build hybrid human-AI pipelines with manual checkpoints

### Get Completion

Retrieve the result of an async canvas execution. Use this operation to poll for completion status when using async execution.

**Parameters:**

| Field            | Type   | Required | Description                              |
| ---------------- | ------ | -------- | ---------------------------------------- |
| **Completion ID** | String | Yes      | The ID returned from async execution     |

**Response:**

- Returns the full API response object with `id`, `status`, and `outputContent`

**Use Cases:**

- Poll for long-running canvas executions
- Build async workflows with wait loops
- Handle high-latency AI processing without timeouts

## Node Reference

### Credentials

| Field       | Description                           |
| ----------- | ------------------------------------- |
| **API Key** | Your Tela API key from your dashboard |

### Parameters

| Field         | Type       | Required | Description                                       |
| ------------- | ---------- | -------- | ------------------------------------------------- |
| **Project**   | Options    | Yes      | Select the project containing your canvas         |
| **Canvas**    | Options    | Yes      | Select the canvas to execute                      |
| **Variables** | Collection | No       | Dynamic fields based on your canvas configuration |

## Usage Examples

### Example 1: Basic Canvas Execution

**Input Data:**

```json
{
  "customerName": "John Doe",
  "productType": "Premium Subscription",
  "monthlyAmount": 99.99
}
```

**Canvas Variables:**

- `customer_name`: John Doe
- `product_type`: Premium Subscription
- `monthly_amount`: 99.99

**Result:** AI-generated personalized content based on your canvas configuration.

### Example 2: File Processing

**Input Data:**

```json
{
  "document": "binary_file_data",
  "processingType": "summarize"
}
```

**Canvas Variables:**

- `document`: [File upload]
- `processing_type`: summarize

**Result:** AI-processed document with summary or analysis.

### Example 3: Dynamic Content Generation

**Input Data:**

```json
{
  "industry": "Technology",
  "companySize": "100-500 employees",
  "challenge": "Digital transformation"
}
```

**Canvas Variables:**

- `industry`: Technology
- `company_size`: 100-500 employees
- `challenge`: Digital transformation

**Result:** Tailored content addressing specific business challenges.

## Sample Workflows

### Workflow 1: Automated Customer Onboarding

1. **Webhook** receives new customer signup
2. **Tela** generates personalized welcome email
3. **Send Email** delivers the generated content

### Workflow 2: Document Processing Pipeline

1. **File Upload** receives document
2. **Tela** processes and analyzes document
3. **Database** stores processed results
4. **Notification** sends completion alert

### Workflow 3: Marketing Campaign Generator

1. **CRM** provides customer segments
2. **Tela** generates personalized campaigns
3. **Marketing Platform** deploys campaigns
4. **Analytics** tracks performance

## Advanced Features

### Dynamic Variable Detection

The node automatically detects canvas variables and their types:

- **Text variables**: Standard string inputs
- **File variables**: Automatic file upload handling
- **Required fields**: Clearly marked in the interface

### Smart File Handling

- Supports multiple file formats
- Automatic MIME type detection
- Secure file upload to Tela servers
- Binary data processing from n8n workflows

### Load Options

- **Projects**: Dynamically loads available projects
- **Canvases**: Loads canvases based on selected project
- **Variables**: Auto-populates variable fields based on canvas

## Compatibility

- **n8n Version**: 0.174.0 or later
- **Node.js**: 18.0.0 or later
- **npm**: 8.0.0 or later
- **Platforms**: n8n Cloud, Self-hosted instances

## Troubleshooting

### Common Issues

1. **API Key Invalid**

   - Verify your Tela API key is correct
   - Check if the key has expired
   - Ensure proper permissions

2. **Project Not Loading**

   - Verify API key has access to projects
   - Check Tela API status
   - Refresh credentials

3. **Canvas Execution Fails**
   - Verify all required variables are set
   - Check canvas configuration in Tela
   - Review API response for error details

### Error Messages

- `Failed to load projects`: Check API key and permissions
- `Failed to load canvases`: Verify project ID and access
- `Failed to execute canvas`: Review variable configuration

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Tela API Documentation](https://docs.tela.com)
- [n8n Workflow Automation](https://n8n.io)
- [Community Support](https://community.n8n.io)

## Support

### Getting Help

- **GitHub Issues**: [Report bugs and request features](https://github.com/meistrari/n8n-nodes-tela/issues)
- **n8n Community**: [Ask questions in the community](https://community.n8n.io)
- **Documentation**: [Check the comprehensive docs](https://docs.n8n.io)

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/meistrari/n8n-nodes-tela.git
cd n8n-nodes-tela

# Install dependencies
npm install

# Build the project
npm run build

# Link locally for testing
npm link
```

### Testing

```bash
# Run tests
npm test

# Build and test
npm run build && npm test
```

## Changelog

### Version 1.4.0

**BREAKING CHANGE: Simplified API Response Handling**

All operations now return the raw API response directly instead of formatted/transformed data.

#### Breaking Changes

- **Execute Canvas**: Now returns the full `CompletionResponse` object from the API
  - Before: `data.choices[0].message?.content` (sync) or `{ id, status }` (async)
  - After: Full API response object

- **Execute Workstation**: Now returns the full API response
  - Before: `{ status: "created" }`
  - After: Full `CompletionResponse` object from the API

- **Get Completion**: Now returns the full API response
  - Before: `{ status, ...outputContent }` (succeeded) or `{ status }` (pending)
  - After: Full `GetCompletionResponse` object with `id`, `status`, and `outputContent`

#### Migration Guide

If your workflows depend on the previous response format, you'll need to update your expressions:

```
# Execute Canvas (sync) - accessing content
Before: {{ $json.fieldName }}
After:  {{ $json.choices[0].message.content.fieldName }}

# Execute Canvas (async) - accessing id/status
Before: {{ $json.id }}
After:  {{ $json.id }}  (no change needed)

# Get Completion - accessing output content
Before: {{ $json.fieldName }}
After:  {{ $json.outputContent.content.fieldName }}
```

#### Why This Change?

- Provides full API response data for advanced use cases
- Eliminates data loss from response transformation
- Gives users complete control over how to process the response
- Simplifies codebase maintenance

### Version 1.2.0

**New Features: Async Execution, Completion Polling & Workstation Integration**

#### New Operations
- **Execute Workstation**: Create tasks in the Tela Workstation dashboard
  - Tasks are visible in the Tela web interface for review and approval
  - Supports optional `label` field for task identification
  - Automatically fetches `application_id` from the canvas
  - Returns `{ status: "created" }` on success

- **Get Completion**: Retrieve the result of an async canvas execution
  - Accepts a `completionId` parameter
  - Returns `{ status, ...content }` when succeeded
  - Returns `{ status }` when still processing (for polling workflows)

#### Execute Canvas Enhancements
- **Async Execution**: New toggle to execute canvases asynchronously
  - When enabled, returns immediately with `{ id, status }` instead of waiting for completion
  - Ideal for long-running AI tasks that may exceed timeout limits
  - Enables building polling workflows with Wait + If nodes

#### Use Case: Async Workflow Pattern
```
1. [Tela: Execute Canvas] (Async: ON) → { id: "abc-123", status: "pending" }
2. [Wait] → 5 seconds
3. [Tela: Get Completion] (ID: {{ $json.id }}) → { status: "pending" } or { status: "succeeded", ...content }
4. [If] status !== "succeeded" → Loop back to step 2
5. [Continue] → Process the completed result
```

#### Use Case: Workstation Task Creation
```
1. [Webhook] → Receive data from external system
2. [Tela: Execute Workstation] → Create task with label "{{ $json.customer }} - {{ $json.orderId }}"
3. [Task appears in Tela dashboard for human review]
```

#### Technical Details
- Added `async` parameter to completion request body
- Added `status` field to completion response types
- New `GetCompletionResponse` type for get completion endpoint
- New `PromptApplication` and `WorkstationRequest` types
- New `/prompt-application` endpoint integration
- Graceful error handling for polling requests

### Version 1.1.2

**UX Pattern compliance for n8n verification:**

#### n8n Verification Requirements
- **Implemented Resources and Operations pattern**: Added standard n8n UX pattern with Resource and Operation dropdowns
  - Resource: Canvas (single option, extensible for future resources)
  - Operation: Execute (executes a canvas with variables)
  - All existing functionality preserved and unchanged
  - No breaking changes - workflows continue to work seamlessly

#### User Experience Improvements
- **Better discoverability**: Users can now see available resources and operations in dropdown menus
- **Consistent with n8n ecosystem**: Follows the same UX pattern as official n8n nodes
- **Future-proof architecture**: Easy to extend with additional operations (Get Details, List, etc.)

#### Technical Details
- Added `resource` property with 'canvas' option
- Added `operation` property with 'execute' action
- Updated all existing properties with `displayOptions` to show conditionally
- Maintains backwards compatibility with existing workflows

#### Breaking Changes
- None - all changes are backwards compatible

### Version 1.1.0

**Major improvements for n8n Cloud verification compliance:**

#### Critical Fixes
- **Removed dependency overrides**: Eliminated `overrides` section from package.json to prevent masking security vulnerabilities
- **Replaced native fetch() with n8n HTTP helpers**: All API requests now use n8n's `httpRequest` helper for proper proxy support, retry logic, and request logging
- **Added pairedItem linking**: Implemented proper data flow tracking with `pairedItem` metadata on all outputs

#### High Priority Improvements
- **Enhanced error logging**: Replaced `console.error` with n8n's logger service for better debugging in production
- **Added continueOnFail support**: Workflows can now handle errors gracefully and continue processing remaining items
- **Multi-item processing**: Refactored execute() method to properly process multiple input items in batch

#### Quality Improvements
- **Converted icon to SVG format**: Replaced PNG icon with SVG for better scalability and 70% smaller file size
  - Updated both node and credential files to use `tela.svg`
  - Removed legacy PNG icon from build output
  - Consistent icon format across entire package
- **Improved error handling**: Added `NodeOperationError` with detailed metadata including itemIndex
- **Better type safety**: Enhanced TypeScript types for HTTP request methods

#### Breaking Changes
- None - all changes are backwards compatible

#### Developer Experience
- Enhanced logging visibility in n8n execution logs
- Better error messages with actionable descriptions
- Improved workflow debugging with proper data flow tracking

### Version 1.0.16

- Replace get prompts call (includeLastVersion=true) for /promoted-version endpoint (the old one was deprecated internally)

### Version 1.0.15

- Fixed critical security vulnerabilities in transitive dependencies
- Updated axios from vulnerable version to 1.12.2 (fixes CVE-2025-58754)
- Updated form-data from vulnerable version to 4.0.4 (fixes CVE-2025-7783)
- Added npm overrides to ensure secure dependency versions across all packages
- Zero vulnerabilities reported by npm audit

### Version 1.0.14

- Added credential test method to fix n8n verification pre-checks
- Fixed n8n verification pre-checks by restructuring project to match n8n-nodes-starter template
- Moved credentials and nodes to proper directories as required by n8n
- Enhanced README documentation for n8n verification compliance
- Added comprehensive usage examples and sample workflows
- Improved installation and configuration instructions
- Added troubleshooting guide and development documentation

### Version 1.0.1

- Enhanced error handling
- Improved file upload support
- Better variable validation

### Version 1.0.0

- Initial release
- Basic Tela API integration
- Dynamic variable support

## License

[MIT](LICENSE.md)
