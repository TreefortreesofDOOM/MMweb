import { Check, HelpCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils/common-utils"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface VerificationRequirement {
  complete: boolean
  message: string
}

interface ValidationTrackerProps {
  requirements: {
    profile_complete: VerificationRequirement
    portfolio_quality: VerificationRequirement
    platform_engagement: VerificationRequirement
  }
  progress: number
  isVerified: boolean
  className?: string
}

const requirementDetails = {
  profile_complete: {
    title: "Complete Profile",
    description: "Add your personal information, bio, and social links",
    tooltip: "A complete profile helps collectors understand your work and journey",
    action: "/profile/edit"
  },
  portfolio_quality: {
    title: "Portfolio Quality",
    description: "Upload high-quality artworks with detailed information",
    tooltip: "Your portfolio should showcase your best work with proper descriptions and pricing",
    action: "/artist/artworks/new"
  },
  platform_engagement: {
    title: "Platform Engagement",
    description: "Build your presence on the platform",
    tooltip: "Active participation helps you connect with collectors and grow your audience",
    action: "/profile"
  }
} as const;

export function ValidationTracker({
  requirements,
  progress,
  isVerified,
  className
}: ValidationTrackerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="font-medium">Verification Progress</h3>
            <p className="text-sm text-muted-foreground">
              Complete these requirements to become verified
            </p>
          </div>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Requirements List */}
      <div className="grid gap-4">
        {Object.entries(requirements).map(([key, requirement]) => {
          const details = requirementDetails[key as keyof typeof requirementDetails];
          
          return (
            <div
              key={key}
              className={cn(
                "p-4 rounded-lg border",
                requirement.complete
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/50 border-muted"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium",
                      requirement.complete ? "text-primary" : "text-foreground"
                    )}>
                      {details.title}
                    </h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{details.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {details.description}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    {requirement.message}
                  </p>
                </div>
                {!requirement.complete && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={details.action}
                      className="whitespace-nowrap"
                      role="button"
                      aria-label={`Complete ${details.title}`}
                      tabIndex={0}
                    >
                      Complete Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Steps */}
      {!isVerified && progress === 100 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium text-primary">Ready for Review</h4>
              <p className="text-sm text-muted-foreground">
                All requirements complete! Your application will be reviewed soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 