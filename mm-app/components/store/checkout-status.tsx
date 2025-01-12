import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CheckoutStatusProps {
  status: 'success' | 'error' | 'loading' | 'cancelled';
  message?: string;
}

export function CheckoutStatus({ status, message }: CheckoutStatusProps) {
  const statusConfig = {
    success: {
      icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
      title: 'Payment Successful!',
      defaultMessage: 'Thank you for your purchase. The artist will be notified and will process your order shortly.',
      actions: (
        <>
          <Button asChild variant="outline">
            <Link href="/store">Continue Shopping</Link>
          </Button>
          <Button asChild>
            <Link href="/account/orders">View Orders</Link>
          </Button>
        </>
      )
    },
    error: {
      icon: <AlertCircle className="h-8 w-8 text-red-500" />,
      title: 'Payment Error',
      defaultMessage: 'There was an error processing your payment. Please try again or contact support.',
      actions: (
        <Button asChild>
          <Link href="/store">Return to Store</Link>
        </Button>
      )
    },
    loading: {
      icon: <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />,
      title: 'Processing Payment',
      defaultMessage: 'Please wait while we confirm your payment...',
      actions: null
    },
    cancelled: {
      icon: <XCircle className="h-8 w-8 text-red-500" />,
      title: 'Payment Cancelled',
      defaultMessage: 'Your payment was cancelled. No charges were made to your account.',
      actions: (
        <Button asChild>
          <Link href="/store">Return to Store</Link>
        </Button>
      )
    }
  };

  const config = statusConfig[status];

  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            {config.icon}
            <CardTitle>{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {message || config.defaultMessage}
          </p>
        </CardContent>
        {config.actions && (
          <CardFooter className="flex justify-end space-x-4">
            {config.actions}
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 