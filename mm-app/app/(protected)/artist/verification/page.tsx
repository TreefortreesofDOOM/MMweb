import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RequirementsList } from '@/components/verification/requirements-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { checkVerificationRequirements } from '@/lib/actions/verification';

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'artist') {
    return redirect('/profile');
  }

  // Check verification requirements
  const { verified, progress, error } = await checkVerificationRequirements(user.id);

  const isVerifiedArtist = profile.artist_type === 'verified' || verified;
  const isEmergingArtist = profile.artist_type === 'emerging' && !verified;
  const hasExhibitionBadge = profile.exhibition_badge;

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="space-y-6">
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

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
                  {hasExhibitionBadge && (
                    <p className="mt-2">
                      You have also been selected for exhibition in our physical gallery.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Verification Journey</CardTitle>
                <CardDescription>
                  Complete the requirements below to become a verified artist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As an emerging artist, you can publish up to 10 artworks. Complete the verification
                  requirements to unlock unlimited uploads and additional features.
                </p>
              </CardContent>
            </Card>

            <RequirementsList />
          </>
        )}
      </div>
    </div>
  )
} 