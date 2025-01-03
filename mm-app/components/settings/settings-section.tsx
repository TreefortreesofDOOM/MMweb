import { FC, PropsWithChildren } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SettingsSectionProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export const SettingsSection: FC<SettingsSectionProps> = ({
  title,
  description,
  children
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}; 