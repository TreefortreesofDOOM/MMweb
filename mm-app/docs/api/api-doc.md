# MM Web API Documentation

## Overview

This document provides comprehensive documentation for the MM Web API endpoints. The API is built using Next.js 13+ App Router API routes and follows RESTful principles.

## Base URL

```
/api
```

## API Groups

### 1. AI Endpoints (`/api/ai/`)

#### Analytics
- **Endpoint**: `/ai/analytics`
- **Method**: POST
- **Description**: Tracks and processes AI-related analytics data
- **Implementation**: Large-scale analytics processing (521 lines)

#### Artwork Analysis
- **Endpoint**: `/ai/analyze-artwork`
- **Method**: POST
- **Description**: Analyzes artwork using AI models
- **Implementation**: Artwork-specific analysis (37 lines)

#### AI Assistant
- **Endpoint**: `/ai/assistant`
- **Method**: POST
- **Description**: Provides AI assistant functionality
- **Implementation**: Core AI assistant features (284 lines)

#### Chat Interface
- **Endpoint**: `/ai/chat`
- **Method**: POST
- **Description**: Handles AI chat interactions
- **Implementation**: Chat interface management (136 lines)

#### Biography Extraction
- **Endpoint**: `/ai/extract-bio`
- **Method**: POST
- **Description**: Extracts and processes artist biographies
- **Implementation**: Biography extraction utility (15 lines)

### 2. Vertex AI Integration (`/api/vertex-ai/`)

#### Vector Search
- **Endpoint**: `/vertex-ai/search`
- **Method**: POST
- **Description**: Performs vector-based semantic search
- **Implementation**: Search functionality (43 lines)

#### Setup Endpoints
- **Endpoint**: `/vertex-ai/setup`
- **Description**: Initializes Vertex AI services
- **Implementation**: Main setup handler (53 lines)

- **Endpoint**: `/vertex-ai/setup-bigquery`
- **Description**: Configures BigQuery integration
- **Implementation**: BigQuery setup (55 lines)

#### Test Endpoints
- **Endpoint**: `/vertex-ai/test`
- **Description**: Testing endpoint for Vertex AI functionality

- **Endpoint**: `/vertex-ai/test-setup`
- **Description**: Validates setup configuration

### 3. Gallery Management (`/api/gallery/`)

#### Visit Tracking
- **Endpoint**: `/gallery/visit/[userId]`
- **Method**: POST
- **Description**: Tracks user visits and interactions in the gallery
- **Parameters**:
  - `userId`: User identifier

### 4. Artwork Management (`/api/artworks/`)

#### Individual Artwork
- **Endpoint**: `/artworks/[id]`
- **Methods**: GET, PUT, DELETE
- **Description**: CRUD operations for individual artworks
- **Parameters**:
  - `id`: Artwork identifier

### 5. Stripe Integration (`/api/stripe/`)

#### Connect
- **Endpoint**: `/stripe/connect`
- **Method**: POST
- **Description**: Handles Stripe Connect integration for artists

#### Login Link
- **Endpoint**: `/stripe/login-link`
- **Method**: POST
- **Description**: Generates Stripe dashboard login links

#### Payment Link
- **Endpoint**: `/stripe/payment-link`
- **Method**: POST
- **Description**: Creates payment links for transactions

### 6. Verification System (`/api/verification/`)

#### Refresh Verification
- **Endpoint**: `/verification/refresh`
- **Method**: POST
- **Description**: Refreshes user verification status

### 7. Webhook Handlers (`/api/webhooks/`)

#### Stripe Webhooks
- **Endpoint**: `/webhooks/stripe`
- **Method**: POST
- **Description**: Handles Stripe webhook events

### 8. Settings Management (`/api/settings/`)

#### Get Settings
- **Endpoint**: `/settings`
- **Method**: GET
- **Description**: Retrieves user settings from database
- **Implementation**: Core settings retrieval (28 lines)

#### Update Preferences
- **Endpoint**: `/settings/preferences`
- **Method**: PATCH
- **Description**: Updates user theme and AI preferences
- **Implementation**: Preferences management (35 lines)

#### Update Notifications
- **Endpoint**: `/settings/notifications`
- **Method**: PATCH
- **Description**: Manages notification preferences
- **Implementation**: Notification settings handler (42 lines)

#### Update Role Settings
- **Endpoint**: `/settings/role`
- **Method**: PATCH
- **Description**: Updates role-specific settings for artists/patrons
- **Implementation**: Role settings management (38 lines)

### 9. MM AI Agent (`/api/agent/mm-ai/`)

#### Post Artwork
- **Endpoint**: `/agent/mm-ai`
- **Method**: POST
- **Description**: Creates AI-generated artwork posts
- **Authentication**: Bearer token (MM_AI_AGENT_KEY)
- **Request Headers**:
  ```
  Authorization: Bearer <MM_AI_AGENT_KEY>
  Content-Type: application/json
  x-request-id: <optional-request-id>
  ```
- **Request Body**:
  ```typescript
  {
    // Required fields
    title: string;          // Max 100 characters
    images: Array<{
      url: string;         // Valid image URL
      alt: string;         // Required for accessibility
    }>;
    aiGenerated: true;     // Must be true
    aiContext: {           // UnifiedAI context
      model: string;
      prompt: string;
      parameters: Record<string, unknown>;
    };

    // Optional fields
    description?: string;  // Max 1000 characters
    tags?: string[];      // Max 10 tags, each max 30 characters
    analysisResults?: Array<{
      type: string;
      data: unknown;
    }>;
    metadata?: {
      confidence: number;
      model: string;
      generation: {
        prompt: string;
        parameters: Record<string, unknown>;
      };
      accessibility: {
        altText: string;
        description: string;
      };
    };
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
- **Error Responses**:
  - 401 Unauthorized:
    ```json
    {
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Missing authorization header"
      }
    }
    ```
  - 400 Bad Request:
    ```json
    {
      "error": {
        "code": "INVALID_INPUT",
        "message": "Title must be less than 100 characters",
        "details": {
          "field": "title",
          "maxLength": 100
        }
      }
    }
    ```
  - 500 Internal Server Error:
    ```json
    {
      "error": {
        "code": "UNEXPECTED_ERROR",
        "message": "An unexpected error occurred"
      }
    }
    ```
- **Implementation**: Server action with validation (156 lines)
- **Rate Limits**: 100 requests per minute
- **Security**:
  - Bearer token authentication
  - Input validation
  - RLS policies
  - Image URL validation
  - Content type verification

## Authentication

Most API endpoints require authentication through:
1. Session token validation
2. Role-based access control
3. API key validation for external services

## Error Handling

All API endpoints follow a standard error response format:
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

## Rate Limiting

API endpoints are protected by rate limiting based on:
- IP address
- User authentication
- Endpoint-specific limits

## Best Practices

1. **Authentication**
   - Always verify user session
   - Validate permissions
   - Use appropriate auth middleware

2. **Error Handling**
   - Use consistent error formats
   - Provide meaningful error messages
   - Include appropriate HTTP status codes

3. **Data Validation**
   - Validate input parameters
   - Sanitize user input
   - Use TypeScript types for payload validation

4. **Performance**
   - Implement caching where appropriate
   - Use pagination for large datasets
   - Optimize database queries

## API Versioning

Current API version: v1 (implicit in routes)

Future versions will be explicitly versioned:
```
/api/v2/...
```

## Testing

API endpoints can be tested using:
1. Integration tests
2. Unit tests
3. End-to-end tests

Test endpoints are available in development:
- `/api/test/`
- `/api/test-email/`

## Security Considerations

1. **Authentication**
   - JWT validation
   - Session management
   - Role-based access

2. **Data Protection**
   - Input sanitization
   - XSS prevention
   - CSRF protection

3. **Rate Limiting**
   - Request throttling
   - DDoS protection
   - API key validation

## Development Guidelines

1. **Route Handlers**
   - Use Next.js App Router conventions
   - Implement proper error handling
   - Follow TypeScript best practices

2. **Middleware**
   - Auth middleware
   - Logging middleware
   - Rate limiting middleware

3. **Testing**
   - Write comprehensive tests
   - Use test utilities
   - Mock external services

## API Client Usage

Example usage with fetch:

```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Hello AI',
  }),
});

const data = await response.json();
```

## Monitoring and Logging

API endpoints are monitored for:
1. Performance metrics
2. Error rates
3. Usage patterns
4. Security incidents

## Future Improvements

1. **API Features**
   - GraphQL integration
   - WebSocket support
   - Enhanced caching

2. **Documentation**
   - OpenAPI/Swagger specs
   - Interactive documentation
   - More code examples

3. **Security**
   - Enhanced rate limiting
   - API key management
   - Audit logging
