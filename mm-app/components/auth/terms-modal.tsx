import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TermsModalProps {
  onAccept: (accepted: boolean) => void;
  checked: boolean;
}

export function TermsModal({ onAccept, checked }: TermsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="terms" 
        checked={checked}
        onCheckedChange={(checked) => {
          if (checked && !isOpen) {
            setIsOpen(true);
          }
          onAccept(!!checked);
        }}
        aria-label="Accept terms and privacy policy"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => setIsOpen(true)}
          >
            Terms & Privacy Policy
          </Button>
        </Label>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
            <DialogDescription>
              Please read and accept our Terms of Service and Privacy Policy
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Terms of Service</h3>
              <p className="text-sm text-muted-foreground">
                By using Meaning Machine, you agree to these terms...
                {/* Add actual terms content */}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">
                Your privacy is important to us...
                {/* Add actual privacy policy content */}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onAccept(false);
                }}
              >
                Decline
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  onAccept(true);
                }}
              >
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 