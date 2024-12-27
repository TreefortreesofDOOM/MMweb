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
    <div className="container flex items-center justify-center h-[calc(100vh-4rem)] -mt-16">
      <AuthForm className="w-full max-w-[400px] p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                className="text-primary hover:underline" 
                href="/sign-up"
              >
                Sign up
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
                suppressHydrationWarning
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-sm text-muted-foreground hover:text-primary"
                  href="/forgot-password"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                required
                className="mt-2"
                suppressHydrationWarning
              />
            </div>

            <SubmitButton 
              pendingText="Signing in..." 
              formAction={signInAction} 
              suppressHydrationWarning
              className="w-full"
            >
              Sign in
            </SubmitButton>

            <FormMessage message={searchParams} />
          </div>
        </div>
      </AuthForm>
    </div>
  );
}
