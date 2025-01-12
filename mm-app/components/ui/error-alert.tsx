import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type ErrorAlertProps = {
  title: string;
  description: string;
};

export function ErrorAlert({ title, description }: ErrorAlertProps) {
  return (
    <div className="container max-w-6xl py-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
} 