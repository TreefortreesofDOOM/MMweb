'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelectionWizard } from '@/components/role/role-selection-wizard';
import { AuthForm } from '@/components/auth/auth-form';
import { FormMessage, type Message } from '@/components/ui/form-message';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/lib/navigation/types';
import { updateUserRole } from '@/lib/actions/role';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole>();
  const [error, setError] = useState<Message>();
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedRole) {
      setError({ error: 'Please select a role to continue' });
      return;
    }

    try {
      await updateUserRole(selectedRole);
      router.push('/profile');
    } catch (error) {
      setError({ error: 'Failed to update role. Please try again.' });
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] -mt-16">
      <AuthForm className="w-full max-w-4xl p-8 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Choose Your Role</h1>
          <p className="text-sm text-muted-foreground">
            Select how you want to use Meaning Machine. You can change this later.
          </p>
        </div>

        <RoleSelectionWizard
          selectedRole={selectedRole}
          onRoleSelect={handleRoleSelect}
        />

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
            formAction={handleSubmit}
            disabled={!selectedRole}
          >
            Continue
          </Button>

          {error && <FormMessage message={error} />}
        </div>
      </AuthForm>
    </div>
  );
} 