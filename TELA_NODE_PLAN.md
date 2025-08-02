# Tela n8n Custom Node - Implementation Plan

## Overview

This document outlines the complete implementation plan for enhancing the existing Tela n8n custom node with dynamic dropdowns, file handling, and structured output support.

## Current Implementation Status

### ✅ Already Implemented

- Basic node structure (`Tela.node.ts`)
- API key credential system (`credentials.ts`)
- Basic completion API call to `/v2/chat/completions`
- Project configuration (`package.json`, `tsconfig.json`)

### 🔧 Current Limitations

- Hardcoded canvas ID input
- Simple payload string input
- No dynamic project/canvas selection
- No file upload support
- No variable type handling
- No structured output support

## Planned Architecture

### 1. Service Layer Implementation

Create a new service layer to abstract API calls:

```
src/
├── services/
│   ├── TelaApiService.ts      # Main API service class
│   ├── types.ts               # TypeScript interfaces
│   └── constants.ts           # API endpoints and constants
```

#### TelaApiService.ts Features

- Centralized API communication
- Error handling and retry logic
- Authentication header management
- Response parsing and validation

### 2. Dynamic Dropdown Implementation

#### Project Selection Dropdown

- **Endpoint**: `GET https://api.tela.com/project`
- **Headers**: `Authorization: Bearer {api_key}`
- **Purpose**: Load available projects for the user
- **Implementation**: Dynamic options loading in node properties

#### Canvas Selection Dropdown

- **Endpoint**: `GET https://api.tela.com/prompt`
- **Query Parameters**:
  - `projectId`: Selected from project dropdown
  - `includeStats=false`
  - `includeLastVersion=true`
- **Purpose**: Load available canvases from selected project
- **Implementation**: Dependent dropdown that updates based on project selection

### 3. Dynamic Variable Input System

#### Variable Discovery

From the canvas API response, extract the `variables` array:

```json
"lastVersion": {
    "variables": [
        {
            "description": "",
            "required": true,
            "name": "peticao_inicial",
            "type": "text",
            "processingOptions": {
                "allowMultimodal": false
            }
        }
    ]
}
```

#### Dynamic Field Generation

For each variable discovered:

1. Create a dropdown for input type selection (text, json, file)
2. Create an input field for the actual value
3. Apply conditional rendering based on type selection

### 4. File Upload System

#### File Upload Flow

1. **Vault Creation**: `POST https://api.tela.com/v2/file`

   - Creates a vault entry
   - Returns `upload_url` and `download_url`

2. **File Upload**: `PUT {upload_url}`

   - Upload actual file content
   - Content-Type based on file type

3. **Variable Usage**: Use `download_url` in completion request
   ```json
   "variables": {
       "video": {
           "file_url": "https://tmp.files.tela.com/1a280726-e09e-4d68-928e-c2227d9b89d6/"
       }
   }
   ```

### 5. Variable Type Handling

#### Text Type

- Direct string value
- Apply `toString()` for non-string inputs

#### JSON Type

- Convert to string format: `toJsonString().replaceAll('"', "'")`
- API receives JSON as string, LLM interprets as JSON

#### File Type

- Follow file upload flow
- Use `download_url` in variable object
- Support multimodal processing when enabled

### 6. Structured Output Support

#### Output Schema Discovery

From the prompt (like the variables) response, extract `structuredOutput`:

```json
"lastVersion": {
    "configuration": {
"structuredOutput": {
    "enabled": true,
    "schema": {
        "properties": {
            "Preliminares": {
                "type": "object",
                "properties": {
                    "prescricao": {
                        "id": "01JYN0W9Y8G9CZY0ZV7NH6EJWB",
                        "type": "boolean",
                        "description": "..."
                    }
                }
            }
        }
    }
}
    }
 }
```

#### n8n Output Schema Integration

- Define output schema in node description
- Provide structured output typing
- Enable better downstream node integration

## Implementation Phases

### [X] Phase 1: Service Layer Foundation

- [X] Create `TelaApiService.ts` with basic API methods
- [X] Implement authentication and error handling
- [X] Create TypeScript interfaces for API responses
- [X] Add utility functions for data transformation

### [X] Phase 2: Dynamic Dropdowns

- [X] Implement project loading functionality
- [X] Add project selection dropdown to node properties
- [X] Implement canvas loading based on project selection
- [X] Add canvas selection dropdown with dependency logic

### [X] Phase 3: Variable System

- [X] Parse variables from canvas response
- [X] Generate dynamic input fields based on variables
- [X] Implement variable type selection dropdowns
- [X] Add conditional rendering for different input types

### [ ] Phase 4: File Upload Integration

- [ ] Implement vault creation API call
- [ ] Add file upload functionality
- [ ] Integrate file URLs into variable system
- [ ] Add file type validation and error handling

### [ ] Phase 5: Enhanced Completion API

- [ ] Update completion request building
- [ ] Implement proper variable formatting by type
- [ ] Add structured output schema support
- [ ] Enhance response processing

### [ ] Phase 6: Testing and Optimization

- [ ] Add comprehensive error handling
- [ ] Implement retry logic for API calls
- [ ] Add input validation
- [ ] Optimize performance for large files
- [ ] Add logging and debugging support

## Technical Considerations

### Error Handling

- API rate limiting
- Network timeouts
- Invalid credentials
- File upload failures
- Large file handling

### Performance

- Caching dropdown data
- Async file uploads
- Progress indicators for large operations
- Memory management for file handling

### Security

- Secure credential storage
- File type validation
- Size limits for uploads
- Input sanitization

### User Experience

- Clear loading states
- Helpful error messages
- Progressive disclosure
- Intuitive field organization

## File Structure Changes

```
src/
├── Tela.node.ts              # Enhanced main node (updated)
├── credentials.ts            # Existing credential system
├── index.ts                  # Entry point
├── services/
│   ├── TelaApiService.ts     # API service layer (new)
│   ├── types.ts              # TypeScript interfaces (new)
│   └── constants.ts          # API endpoints (new)
├── utils/
│   ├── fileUtils.ts          # File handling utilities (new)
│   └── validationUtils.ts    # Input validation (new)
└── tela.png                  # Node icon
```

## Success Criteria

### Functional Requirements

- ✅ Dynamic project selection
- ✅ Dynamic canvas selection based on project
- ✅ Automatic variable discovery and field generation
- ✅ Support for text, JSON, and file variable types
- ✅ File upload with vault system integration
- ✅ Structured output schema support
- ✅ Backward compatibility with existing workflows

### Non-Functional Requirements

- ✅ Responsive UI with proper loading states
- ✅ Comprehensive error handling
- ✅ Performance optimization for large files
- ✅ Secure credential and file handling
- ✅ Clear documentation and examples

## Dependencies

### Required npm Packages

- `n8n-workflow` (existing)
- `n8n-core` (existing)
- `form-data` (for file uploads)
- `mime-types` (for file type detection)

### API Dependencies

- Tela API endpoints (project, prompt, file, completions)
- Proper API key with required permissions
- Stable network connectivity for file uploads

## Risks and Mitigation

### Technical Risks

- **File Size Limits**: Implement size validation and streaming uploads
- **API Rate Limits**: Add retry logic with exponential backoff
- **Network Failures**: Implement robust error handling and recovery

### User Experience Risks

- **Complex UI**: Use progressive disclosure and clear labeling
- **Long Loading Times**: Add progress indicators and async operations
- **Confusing Variable Types**: Provide clear descriptions and examples

## Future Enhancements

### Potential Improvements

- Batch processing for multiple canvases
- Template saving for common variable configurations
- Advanced file preprocessing options
- Custom variable validation rules
- Integration with other n8n nodes
- Analytics and usage tracking

This plan provides a comprehensive roadmap for transforming the basic Tela n8n node into a fully-featured, dynamic integration with advanced file handling and structured output support.
