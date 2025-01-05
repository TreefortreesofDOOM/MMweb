'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelectionWizard } from '@/components/role/role-selection-wizard';
import { AuthForm } from '@/components/auth/auth-form';
import { FormMessage, type Message } from '@/components/ui/form-message';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/lib/navigation/types';
import { updateUserRole } from '@/lib/actions/role';
import { useAuth } from '@/hooks/use-auth';

export default function RoleSelection() {
  const router = useRouter();
  const { user } = useAuth();

  const handleRoleSelect = async (role: UserRole) => {
    try {
      await updateUserRole(role);
      router.push('/profile');
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="container flex items-center justify-center h-[calc(100vh-4rem)] -mt-16">
      <div className="w-full max-w-[600px] p-8">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Choose Your Role</h1>
            <p className="text-muted-foreground">
              Select how you'd like to use our platform
            </p>
          </div>

          <RoleSelectionWizard onRoleSelect={handleRoleSelect} />
        </div>
      </div>
    </div>
  );
} 