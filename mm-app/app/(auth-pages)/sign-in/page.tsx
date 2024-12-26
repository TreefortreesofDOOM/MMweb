import { signInAction } from "@/lib/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <AuthForm className="flex-1 flex flex-col w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input 
          name="email" 
          placeholder="you@example.com" 
          required 
          suppressHydrationWarning
        />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
          suppressHydrationWarning
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction} suppressHydrationWarning>
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </AuthForm>
  );
}
