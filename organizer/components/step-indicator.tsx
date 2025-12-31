import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  label: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  accent?: "store" | "organizer" | "admin"
  className?: string
}

const accentColors = {
  store: "bg-[#5DABA8] border-[#5DABA8]",
  organizer: "bg-[#FF6B35] border-[#FF6B35]",
  admin: "bg-[#3B82F6] border-[#3B82F6]",
}

export function StepIndicator({ steps, currentStep, accent = "store", className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isPending = stepNumber > currentStep

          return (
            <div key={index} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all",
                    isCompleted && cn("text-white", accentColors[accent]),
                    isCurrent &&
                      cn(
                        "border-current text-foreground",
                        accent === "store" && "border-[#5DABA8] text-[#5DABA8]",
                        accent === "organizer" && "border-[#FF6B35] text-[#FF6B35]",
                        accent === "admin" && "border-[#3B82F6] text-[#3B82F6]",
                      ),
                    isPending && "border-gray-300 bg-gray-50 text-gray-400",
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span>{stepNumber}</span>}
                </div>
                <span
                  className={cn(
                    "mt-2 text-center text-xs font-medium",
                    isCurrent && "text-foreground",
                    isPending && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn("mx-2 h-0.5 flex-1 transition-all", isCompleted ? accentColors[accent] : "bg-gray-300")}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

