'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FeatureComingSoonProps {
  title: string;
  description: string;
  restrictedTo?: 'verified_artist' | 'emerging_artist' | 'patron' | 'admin';
  badgeText?: string;
}

export function FeatureComingSoon({ 
  title, 
  description, 
  restrictedTo,
  badgeText 
}: FeatureComingSoonProps) {
  const [notifyRequested, setNotifyRequested] = useState(false);

  const handleNotifyClick = () => {
    setNotifyRequested(true);
    toast.success('You will be notified when this feature launches');
  };

  const getBadgeText = () => {
    if (badgeText) return badgeText;
    if (!restrictedTo) return null;

    switch (restrictedTo) {
      case 'verified_artist':
        return 'Verified Artists Only';
      case 'emerging_artist':
        return 'Artists Only';
      case 'patron':
        return 'Patrons Only';
      case 'admin':
        return 'Admins Only';
      default:
        return null;
    }
  };

  const displayBadge = getBadgeText();

  return (
    <Card className="relative">
      {displayBadge && (
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3"
        >
          {displayBadge}
        </Badge>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          onClick={handleNotifyClick}
          disabled={notifyRequested}
        >
          <Bell className="mr-2 h-4 w-4" />
          {notifyRequested ? 'Notification Set' : 'Notify Me When Available'}
        </Button>
      </CardContent>
    </Card>
  );
} 