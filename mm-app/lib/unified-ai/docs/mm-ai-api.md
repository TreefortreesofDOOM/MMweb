# MM AI API Documentation

## Authentication
All requests must include a bearer token in the Authorization header:
```
Authorization: Bearer <MM_AI_AGENT_KEY>
```

## Endpoints

### POST /api/agent/mm-ai
Create a new artwork post from the MM AI agent.

#### Request Headers
```
Authorization: Bearer <MM_AI_AGENT_KEY>
Content-Type: application/json
x-request-id: <optional-request-id>
```

#### Request Body
```typescript
{
  // Required fields
  title: string;          // Max 100 characters
  images: Array<{
    url: string;         // Valid image URL
    alt: string;         // Required for accessibility
  }>;                    // Max 10 images
  aiGenerated: true;     // Must be true
  aiContext: {           // UnifiedAI context
    model: 'dall-e-3';   // Currently only supports DALL-E 3
    prompt: string;
    parameters: {
      size?: '1024x1024' | '1024x1792' | '1792x1024';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
    };
  };

  // Optional fields
  description?: string;  // Max 1000 characters
  tags?: string[];      // Max 10 tags, each max 30 characters
  analysisResults?: Array<{
    type: string;
    content: string;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
    source?: string;
    error?: string;
    results: {
      summary: string;
      details: string[];
    };
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

#### Example Request
```json
{
  "title": "Abstract Sunset",
  "description": "A vibrant abstract interpretation of a sunset over the ocean",
  "images": [
    {
      "url": "https://storage.meaningmachine.ai/artworks/sunset-001.jpg",
      "alt": "Abstract painting with warm orange and red tones blending into deep blue, suggesting a sunset over water"
    }
  ],
  "tags": ["abstract", "sunset", "ocean", "warm colors"],
  "aiGenerated": true,
  "aiContext": {
    "model": "dall-e-3",
    "prompt": "Abstract sunset over ocean, vibrant colors, impressionist style",
    "parameters": {
      "size": "1024x1024",
      "quality": "standard",
      "style": "vivid"
    }
  },
  "metadata": {
    "confidence": 0.95,
    "model": "dall-e-3",
    "generation": {
      "prompt": "Abstract sunset over ocean, vibrant colors, impressionist style",
      "parameters": {
        "size": "1024x1024",
        "quality": "standard",
        "style": "vivid"
      }
    },
    "accessibility": {
      "altText": "Abstract painting with warm orange and red tones blending into deep blue, suggesting a sunset over water",
      "description": "This abstract artwork captures the essence of a sunset over the ocean. The composition uses warm oranges and reds in the upper portion that gradually blend into deep blues below, creating a sense of the sun meeting the water. The style is impressionistic, with visible brushstrokes and a focus on color over detailed form."
    }
  }
}
```

#### Success Response (201 Created)
```json
{
  "ok": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Error Responses

##### 401 Unauthorized
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing authorization header"
  }
}
```

##### 400 Bad Request
```json
{
  "ok": false,
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

##### 500 Internal Server Error
```json
{
  "ok": false,
  "error": {
    "code": "UNEXPECTED_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `INVALID_INPUT` | Input validation failed | - Missing required fields<br>- Field length exceeded<br>- Invalid format |
| `DATABASE_ERROR` | Database operation failed | - Constraint violation<br>- Connection issues |
| `ACCESSIBILITY_ERROR` | Accessibility requirements not met | - Missing alt text<br>- Invalid image metadata |
| `IMAGE_PROCESSING_ERROR` | Image validation failed | - Invalid URL<br>- Unsupported format<br>- Size too large |
| `UNAUTHORIZED` | Authentication failed | - Missing token<br>- Invalid token<br>- Wrong format |
| `UNEXPECTED_ERROR` | Unhandled error occurred | - System errors<br>- Network issues |

## Best Practices

1. **Request IDs**
   - Include a unique `x-request-id` header for request tracking
   - Store this ID for debugging and support

2. **Image Handling**
   - Use HTTPS URLs only
   - Supported formats: JPEG, PNG, WebP
   - Maximum size: 10MB per image
   - Maximum images per post: 10

3. **Content Guidelines**
   - Provide detailed alt text for accessibility
   - Use descriptive titles and tags
   - Include comprehensive metadata

4. **Error Handling**
   - Implement exponential backoff for retries
   - Cache successful responses
   - Log all errors with request IDs

5. **Rate Limiting**
   - Maximum 100 requests per minute
   - Implement backoff when rate limit is reached 