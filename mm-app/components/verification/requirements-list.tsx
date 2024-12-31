'use client';

import { useVerification } from "@/hooks/use-verification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/common-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const requirementGuides = {
  profile_complete: {
    title: "Complete Profile",
    steps: [
      {
        title: "Personal Information",
        description: "Add your full name and professional bio",
        link: "/profile/edit"
      },
      {
        title: "Profile Photo",
        description: "Upload a high-quality profile photo",
        link: "/profile/edit"
      },
      {
        title: "Social Links",
        description: "Connect your website or Instagram",
        link: "/profile/edit"
      }
    ]
  },
  portfolio_quality: {
    title: "Portfolio Quality",
    steps: [
      {
        title: "Artwork Upload",
        description: "Upload at least 5 high-quality artworks",
        link: "/artist/artworks/new"
      },
      {
        title: "Artwork Details",
        description: "Add complete descriptions and pricing",
        link: "/artist/artworks"
      },
      {
        title: "Portfolio Organization",
        description: "Arrange your artworks in a cohesive presentation",
        link: "/artist/portfolio"
      }
    ]
  },
  platform_engagement: {
    title: "Platform Engagement",
    steps: [
      {
        title: "Account Age",
        description: "Maintain an active account for 30 days",
        link: "/profile"
      },
      {
        title: "Profile Views",
        description: "Gain at least 50 profile views",
        link: "/profile"
      },
      {
        title: "Community Participation",
        description: "Engage with the platform community",
        link: "/profile"
      }
    ]
  }
};

export function RequirementsList() {
  const { verificationStatus } = useVerification();

  if (!verificationStatus) {
    return null;
  }

  const { requirements, progress } = verificationStatus;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Requirements</CardTitle>
        <CardDescription>Complete these requirements to become a verified artist</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Accordion type="single" collapsible className="w-full">
          {Object.entries(requirements).map(([key, requirement]) => {
            const guide = requirementGuides[key as keyof typeof requirementGuides];
            
            return (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    {requirement.complete ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <h3 className={cn(
                        "font-medium",
                        requirement.complete ? "text-primary" : "text-muted-foreground"
                      )}>
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {requirement.message}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 pl-8">
                        <div className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{step.title}</h4>
                            <Button asChild variant="ghost" size="sm">
                              <Link 
                                href={step.link}
                                className="text-xs"
                                role="button"
                                aria-label={`Complete ${step.title}`}
                                tabIndex={0}
                              >
                                Complete
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {progress === 100 && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <div className="space-y-1">
                <h4 className="font-medium text-primary">Ready for Review</h4>
                <p className="text-sm text-muted-foreground">
                  All requirements are complete. Your application will be reviewed by our team.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 