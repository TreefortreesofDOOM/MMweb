'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class QRErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error) {
    console.error('QR Code Error:', error);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-4 p-6 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">
              Failed to Display QR Code
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error displaying your QR code. Please try again.
            </p>
          </div>
          <Button
            onClick={this.handleRetry}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
} 