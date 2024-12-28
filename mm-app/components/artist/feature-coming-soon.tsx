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
  verifiedOnly?: boolean;
}

export function FeatureComingSoon({ title, description, verifiedOnly }: FeatureComingSoonProps) {
  const [notifyRequested, setNotifyRequested] = useState(false);

  const handleNotifyClick = () => {
    setNotifyRequested(true);
    toast.success('You will be notified when this feature launches');
  };

  return (
    <Card className="relative">
      {verifiedOnly && (
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3"
        >
          Verified Artists Only
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