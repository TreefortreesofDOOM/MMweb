import { createClient } from '@/lib/supabase/supabase-server';
import { redirect } from 'next/navigation';
import { RequirementsList } from '@/components/verification/requirements-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { checkVerificationRequirements } from '@/lib/actions/verification';
import type { Database } from '@/lib/database.types';
import { ValidationTracker } from '@/components/validation/validation-tracker';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

type UserRole = Database['public']['Enums']['user_role'];

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  // Only fetch what we need from the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verification_status, verification_progress, exhibition_badge')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return redirect('/profile');
  }

  // Check access based on role
  const isEmergingArtist = profile.role === 'emerging_artist';
  const isVerifiedArtist = profile.role === 'verified_artist';
  
  if (!isEmergingArtist && !isVerifiedArtist) {
    return redirect('/profile');
  }

  // Get verification requirements
  const { isVerified, progress, requirements } = await checkVerificationRequirements(user.id);

  return (
    <TooltipProvider>
      <div className="container max-w-4xl mx-auto py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Artist Verification</h1>
              {isVerifiedArtist ? (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Artist
                </Badge>
              ) : isEmergingArtist ? (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Emerging Artist
                </Badge>
              ) : null}
            </div>
            {!isVerifiedArtist && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{progress}% Complete</span>
                <Progress value={progress} className="w-24 h-2" />
              </div>
            )}
          </div>

          {/* Main Content */}
          {isVerifiedArtist ? (
            <Card>
              <CardHeader>
                <CardTitle>Verification Complete</CardTitle>
                <CardDescription>
                  You are now a verified artist on our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Congratulations! You have full access to all artist features.
                    {profile.exhibition_badge && (
                      <p className="mt-2">
                        You have also been selected for exhibition in our physical gallery.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Journey</CardTitle>
                    <CardDescription>
                      Track your progress towards becoming a verified artist
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ValidationTracker 
                      requirements={requirements}
                      progress={progress}
                      isVerified={isVerified}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                <RequirementsList />
              </TabsContent>

              <TabsContent value="benefits" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verified Artist Benefits</CardTitle>
                    <CardDescription>
                      Unlock these features when you become verified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Unlimited Artwork Uploads</h3>
                          <p className="text-sm text-muted-foreground">
                            No restrictions on the number of artworks you can showcase
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Enhanced Portfolio Features</h3>
                          <p className="text-sm text-muted-foreground">
                            Access to advanced customization and presentation tools
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Exhibition Eligibility</h3>
                          <p className="text-sm text-muted-foreground">
                            Opportunity to be featured in our physical gallery space
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
} 