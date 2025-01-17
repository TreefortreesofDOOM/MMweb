# Error Handling System Documentation

## Current State Analysis

### 1. Toast Notification Systems
- **Inconsistent Usage**: Currently using two different toast libraries
  - Custom `useToast` hook (Radix UI-based)
  - `sonner` toast library
- **Impact**: Inconsistent user experience and styling across the application

### 2. Error Handling Infrastructure
- **Core Components**:
  - `ErrorService` class in `lib/utils/error/error-service-utils.ts`
  - Base error classes (`BaseError`, `GalleryError`)
  - Typed error interfaces and constants
  - Error logging and formatting utilities

### 3. Error Boundaries
- **Multiple Implementations**:
  - Gallery error boundary
  - Feed error boundaries (Artist, Patron, General)
  - Artist section error boundary
- **Features**: 
  - Fallback UIs
  - Error recovery mechanisms
  - Error reporting

## Implementation Plan (Following .cursorrules)

### Phase 1: Standardize Toast System

1. **Create Unified Toast Utils**
```typescript
// lib/utils/error/toast-utils.ts
import { useToast } from '@/components/ui/use-toast';

export interface ToastOptions {
  duration?: number;
  action?: React.ReactNode;
}

export const toastUtils = {
  success: (message: string, options?: ToastOptions) => {
    useToast().toast({
      title: "Success",
      description: message,
      variant: "default",
      ...options
    });
  },
  error: (message: string, options?: ToastOptions) => {
    useToast().toast({
      title: "Error",
      description: message,
      variant: "destructive",
      ...options
    });
  },
  warning: (message: string, options?: ToastOptions) => {
    useToast().toast({
      title: "Warning",
      description: message,
      variant: "warning",
      ...options
    });
  },
  info: (message: string, options?: ToastOptions) => {
    useToast().toast({
      title: "Info",
      description: message,
      ...options
    });
  }
} as const;
```

2. **Migration Plan**:
   - Identify all `sonner` toast usages
   - Replace with `toastUtils`
   - Update component imports
   - Remove `sonner` dependency

### Phase 2: Enhanced Error Handling

1. **Global Error Handler Hook**
```typescript
// hooks/use-error.ts
import { ErrorService } from '@/lib/utils/error/error-service-utils';
import { toastUtils } from '@/lib/utils/error/toast-utils';

export const useError = () => {
  const handleError = (error: unknown, context: string) => {
    const errorService = new ErrorService();
    const formattedError = errorService.formatErrorResponse(error);
    
    // Log error
    errorService.logError({
      code: formattedError.code,
      message: formattedError.message,
      context,
      type: 'error',
      timestamp: new Date().toISOString()
    });

    // Show toast to user
    toastUtils.error(formattedError.message);

    return formattedError;
  };

  return { handleError };
};
```

2. **Error Boundary Component**
```typescript
// components/common/error-boundary.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ErrorService } from '@/lib/utils/error/error-service-utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  context?: string;
}

export const StandardErrorBoundary = ({ 
  children,
  context = 'general'
}: ErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-4">
            <p>{error.message}</p>
            <Button 
              variant="outline" 
              onClick={resetErrorBoundary}
              className="w-fit"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      onError={(error) => {
        const errorService = new ErrorService();
        errorService.logError({
          code: error.name,
          message: error.message,
          context,
          type: 'error',
          timestamp: new Date().toISOString()
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Phase 3: Error Types and Constants

1. **Error Types**
```typescript
// lib/types/error-types.ts
export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface ApplicationError extends Error {
  code: string;
  severity: ErrorSeverity;
  context?: ErrorContext;
  field?: string;
}
```

2. **Error Codes**
```typescript
// lib/constants/error-codes.ts
export const ERROR_CODES = {
  AUTH: {
    UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED'
  },
  API: {
    NETWORK_ERROR: 'API_NETWORK_ERROR',
    TIMEOUT: 'API_TIMEOUT',
    RATE_LIMIT: 'API_RATE_LIMIT'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
    INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
    CONSTRAINT_VIOLATION: 'VALIDATION_CONSTRAINT_VIOLATION'
  }
} as const;

export type ErrorCode = typeof ERROR_CODES;
```

## Implementation Timeline

1. **Week 1: Toast System Standardization**
   - Create unified toast service
   - Update component imports
   - Remove sonner dependency
   - Test all toast notifications

2. **Week 2: Error Handler Implementation**
   - Implement global error handler
   - Create standardized error boundary
   - Update error logging system
   - Test error capture and reporting

3. **Week 3: Type System and Constants**
   - Define error types and interfaces
   - Create error constants
   - Update existing error handling code
   - Add type checking and validation

4. **Week 4: Testing and Documentation**
   - Write unit tests for error handling
   - Update component documentation
   - Create error handling guidelines
   - Perform end-to-end testing

## Best Practices

1. **Error Handling**
   - Always use typed errors
   - Include context in error messages
   - Log errors appropriately
   - Provide user-friendly error messages

2. **Toast Usage**
   - Keep messages concise
   - Use appropriate variants
   - Include actions when necessary
   - Consider message duration

3. **Error Boundaries**
   - Place at appropriate component levels
   - Include recovery mechanisms
   - Log boundary errors
   - Provide helpful user feedback

## Migration Guide

1. **For Developers**
   - Replace direct toast calls with toast service
   - Update error handling to use global handler
   - Wrap components with standard error boundary
   - Use typed errors and constants

2. **Testing Requirements**
   - Verify error capture and logging
   - Test toast notifications
   - Validate error recovery
   - Check error boundary fallbacks

## Future Considerations

1. **Analytics Integration**
   - Error tracking metrics
   - User impact analysis
   - Performance monitoring
   - Error pattern detection

2. **Enhanced Features**
   - Custom error reporting
   - Error recovery strategies
   - Offline error handling
   - Rate limiting protection 