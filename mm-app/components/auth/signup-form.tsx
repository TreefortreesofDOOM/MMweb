"use client";

import { signUpAction } from "@/lib/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { TermsModal } from "@/components/auth/terms-modal";
import { Progress } from "@/components/ui/progress";
import { useState, useCallback } from "react";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = getStrength(password);
  let color = "bg-red-500";
  if (strength >= 75) color = "bg-green-500";
  else if (strength >= 50) color = "bg-yellow-500";
  else if (strength >= 25) color = "bg-orange-500";

  return (
    <div className="space-y-2">
      <Progress value={strength} className={color} />
      <p className="text-xs text-muted-foreground">
        Password strength: {strength === 100 ? "Strong" : strength >= 75 ? "Good" : strength >= 50 ? "Fair" : "Weak"}
      </p>
    </div>
  );
}

interface SignupFormProps {
  message?: Message;
}

export function SignupForm({ message }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleTermsAccept = useCallback((accepted: boolean) => {
    setTermsAccepted(accepted);
  }, []);

  return (
    <AuthForm className="w-full max-w-[400px] p-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
              className="text-primary hover:underline" 
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              name="email" 
              id="email"
              type="email"
              placeholder="name@example.com" 
              required 
              className="mt-2"
              value={email}
              onChange={handleEmailChange}
              suppressHydrationWarning
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Create a password"
              minLength={8}
              required
              className="mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suppressHydrationWarning
            />
            {password && <PasswordStrengthIndicator password={password} />}
          </div>

          <div>
            <TermsModal 
              checked={termsAccepted}
              onAccept={handleTermsAccept}
            />
          </div>

          <input type="hidden" name="termsAccepted" value={termsAccepted.toString()} />

          <SubmitButton 
            formAction={signUpAction} 
            pendingText="Signing up..." 
            suppressHydrationWarning
            className="w-full"
            disabled={!termsAccepted || isLoading || !isValidEmail(email)}
          >
            Sign up
          </SubmitButton>

          {message && <FormMessage message={message} />}
        </div>
      </div>
    </AuthForm>
  );
} 