'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils/common-utils';
import { Users, Palette, ChevronDown, ChevronUp, BadgeCheck, Store, LineChart, MessageSquare, QrCode } from 'lucide-react';
import type { UserRole } from '@/lib/navigation/types';

interface RoleFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  immediateFeatures: RoleFeature[];
  advancedFeatures: RoleFeature[];
}

interface RoleSelectionWizardProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: UserRole;
}

const collectorFeatures: RoleFeature[] = [
  {
    title: 'Browse Artists',
    description: 'Discover and explore featured artists',
    icon: <Users className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Follow Artists',
    description: 'Stay updated with your favorite artists',
    icon: <BadgeCheck className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Purchase Art',
    description: 'Buy artworks directly from artists',
    icon: <Store className="h-4 w-4" />,
    available: true,
  },
];

const collectorAdvancedFeatures: RoleFeature[] = [
  {
    title: 'Transaction History',
    description: 'View your purchase history',
    icon: <LineChart className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Message Artists',
    description: 'Communicate directly with artists',
    icon: <MessageSquare className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Gallery Visits',
    description: 'Track your gallery visits',
    icon: <QrCode className="h-4 w-4" />,
    available: true,
  },
];

const artistFeatures: RoleFeature[] = [
  {
    title: 'Basic Portfolio',
    description: 'Create and manage your artwork portfolio',
    icon: <Palette className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Artist Profile',
    description: 'Showcase your work and bio',
    icon: <Users className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Verification Path',
    description: 'Progress towards verified artist status',
    icon: <BadgeCheck className="h-4 w-4" />,
    available: true,
  },
];

const artistAdvancedFeatures: RoleFeature[] = [
  {
    title: 'Sales Management',
    description: 'Process sales and manage transactions',
    icon: <Store className="h-4 w-4" />,
    available: false,
  },
  {
    title: 'Analytics',
    description: 'Track portfolio performance',
    icon: <LineChart className="h-4 w-4" />,
    available: false,
  },
  {
    title: 'Gallery Integration',
    description: 'Connect with physical galleries',
    icon: <QrCode className="h-4 w-4" />,
    available: false,
  },
];

const patronFeatures: RoleFeature[] = [
  {
    title: 'Collect Art',
    description: 'Build your personal art collection',
    icon: <Store className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Message Artists',
    description: 'Connect directly with artists',
    icon: <MessageSquare className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Follow Artists',
    description: 'Stay updated with your favorite artists',
    icon: <BadgeCheck className="h-4 w-4" />,
    available: true,
  },
];

const patronAdvancedFeatures: RoleFeature[] = [
  {
    title: 'Collection Management',
    description: 'Organize and showcase your collection',
    icon: <LineChart className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Early Access',
    description: 'Preview new artworks before release',
    icon: <QrCode className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Private Galleries',
    description: 'Access exclusive collections',
    icon: <Store className="h-4 w-4" />,
    available: true,
  },
];

const browseFeatures: RoleFeature[] = [
  {
    title: 'Browse Art',
    description: 'Discover amazing artworks',
    icon: <Users className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Follow Artists',
    description: 'Keep track of artists you like',
    icon: <BadgeCheck className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Basic Interaction',
    description: 'Like and share artworks',
    icon: <MessageSquare className="h-4 w-4" />,
    available: true,
  },
];

const browseAdvancedFeatures: RoleFeature[] = [
  {
    title: 'Public Comments',
    description: 'Engage with the community',
    icon: <MessageSquare className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Save Favorites',
    description: 'Bookmark artworks you love',
    icon: <Store className="h-4 w-4" />,
    available: true,
  },
  {
    title: 'Basic Profile',
    description: 'Create your viewer profile',
    icon: <Users className="h-4 w-4" />,
    available: true,
  },
];

const roleOptions: RoleOption[] = [
  {
    id: 'emerging_artist',
    title: 'Artist',
    description: 'Showcase your work and grow your artistic career',
    icon: <Palette className="h-6 w-6" />,
    immediateFeatures: artistFeatures,
    advancedFeatures: artistAdvancedFeatures,
  },
  {
    id: 'patron',
    title: 'Collector',
    description: 'Discover and collect art from emerging and established artists',
    icon: <Store className="h-6 w-6" />,
    immediateFeatures: patronFeatures,
    advancedFeatures: patronAdvancedFeatures,
  },
  {
    id: 'user',
    title: 'Just Browsing',
    description: 'Explore artwork and follow artists without commitment',
    icon: <Users className="h-6 w-6" />,
    immediateFeatures: browseFeatures,
    advancedFeatures: browseAdvancedFeatures,
  },
];

export function RoleSelectionWizard({ onRoleSelect, selectedRole }: RoleSelectionWizardProps) {
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  
  console.log('RoleSelectionWizard render - selectedRole:', selectedRole);

  const handleRoleSelect = (roleId: UserRole) => {
    console.log('Role selected:', roleId);
    onRoleSelect(roleId);
  };

  const handleToggleFeatures = (e: React.MouseEvent, roleId: string) => {
    e.stopPropagation();
    setExpandedFeatures((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent, roleId: UserRole) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRoleSelect(roleId);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {roleOptions.map((role) => (
        <Card
          key={role.id}
          className={cn(
            'relative cursor-pointer transition-all hover:border-primary',
            selectedRole === role.id && 'border-primary bg-primary/5'
          )}
          tabIndex={0}
          role="button"
          aria-pressed={selectedRole === role.id}
          onClick={() => onRoleSelect(role.id)}
          onKeyDown={(e) => handleKeyDown(e, role.id)}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              {role.icon}
              <div>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Immediate Features</h4>
              <ul className="grid gap-2">
                {role.immediateFeatures.map((feature) => (
                  <li key={feature.title} className="flex items-center gap-2 text-sm">
                    {feature.icon}
                    <span>{feature.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Collapsible
              open={expandedFeatures[role.id]}
              onOpenChange={() => setExpandedFeatures((prev) => ({ ...prev, [role.id]: !prev[role.id] }))}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between"
                  onClick={(e) => handleToggleFeatures(e, role.id)}
                  aria-label={expandedFeatures[role.id] ? 'Show less features' : 'Show more features'}
                >
                  <span>{expandedFeatures[role.id] ? 'Show Less' : 'Learn More'}</span>
                  {expandedFeatures[role.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <h4 className="text-sm font-medium pt-4">Advanced Features</h4>
                <ul className="grid gap-2">
                  {role.advancedFeatures.map((feature) => (
                    <li
                      key={feature.title}
                      className={cn(
                        'flex items-center gap-2 text-sm',
                        !feature.available && 'text-muted-foreground'
                      )}
                    >
                      {feature.icon}
                      <span>{feature.title}</span>
                      {!feature.available && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          (After verification)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>

          <CardFooter className="pt-4">
            <Button
              className="w-full"
              variant={selectedRole === role.id ? 'default' : 'outline'}
              onClick={() => onRoleSelect(role.id)}
            >
              {selectedRole === role.id ? 'Selected' : `Choose ${role.title}`}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 