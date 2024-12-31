import { Message } from "@/components/ui/form-message";
import { SignupForm } from "@/components/auth/signup-form";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="container flex items-center justify-center h-[calc(100vh-4rem)] -mt-16">
      <SignupForm message={"message" in searchParams ? searchParams : undefined} />
    </div>
  );
}
