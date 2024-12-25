"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  suppressHydrationWarning?: boolean;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  suppressHydrationWarning,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      aria-disabled={pending} 
      suppressHydrationWarning={suppressHydrationWarning}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
