import { Check, HelpCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
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

const requirementActions = {
  profile_complete: "/profile/edit",
  portfolio_quality: "/artist/artworks/new",
  platform_engagement: "/profile",
} as const

export const ValidationTracker = ({
  requirements,
  progress,
  isVerified,
  className,
}: ValidationTrackerProps) => {
  const requirementsList = Object.entries(requirements).map(([id, req]) => ({
    id,
    title: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    message: req.message,
    completed: req.complete,
    actionLink: requirementActions[id as keyof typeof requirementActions]
  }))

  const completedCount = requirementsList.filter(req => req.completed).length

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Verification Progress
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{requirementsList.length} Requirements
          </span>
        </CardTitle>
        <CardDescription>
          {isVerified 
            ? "Your account is verified!"
            : "Complete these steps to get verified"}
        </CardDescription>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requirementsList.map((requirement) => (
            <div
              key={requirement.id}
              className={cn(
                "flex items-start space-x-4 rounded-lg border p-4 transition-colors",
                requirement.completed
                  ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-800"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1",
                  requirement.completed
                    ? "bg-green-500 text-white"
                    : "border border-gray-300 dark:border-gray-600"
                )}
              >
                {requirement.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center">
                  <p
                    className={cn(
                      "font-medium",
                      requirement.completed && "text-green-700 dark:text-green-300"
                    )}
                  >
                    {requirement.title}
                  </p>
                  <span className="ml-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>{requirement.message}</TooltipContent>
                    </Tooltip>
                  </span>
                </div>
                {!requirement.completed && (
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                    <Link href={requirement.actionLink}>
                      Complete This Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 