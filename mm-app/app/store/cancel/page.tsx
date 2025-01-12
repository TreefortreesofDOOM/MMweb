import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutStatus } from "@/components/store/checkout-status";
export default function CheckoutCancelPage() {
  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <CardTitle>Payment Cancelled</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/store">Return to Store</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 