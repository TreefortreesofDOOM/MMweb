import { cn } from "@/lib/utils/common-utils";
import { Loader2, type LucideProps } from "lucide-react";

interface SpinnerProps extends Partial<LucideProps> {
  size?: number;
}

export function Spinner({ className, size = 16, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", className)}
      size={size}
      {...props}
    />
  );
} 