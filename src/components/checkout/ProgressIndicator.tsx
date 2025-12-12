/**
 * Progress Indicator
 * Shows current step in checkout flow
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  icon?: string;
}

const STEPS: Step[] = [
  { number: 1, label: "Currency", icon: "💰" },
  { number: 2, label: "Network", icon: "🌐" },
  { number: 3, label: "Review", icon: "📊" },
  { number: 4, label: "Wallet", icon: "👛" },
  { number: 5, label: "Confirm", icon: "✅" },
];

interface ProgressIndicatorProps {
  currentStep: number;
  theme?: "light" | "dark" | "auto";
}

export function ProgressIndicator({ currentStep, theme = "light" }: ProgressIndicatorProps) {
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "complete";
    if (stepNumber === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="w-full py-6">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.number);
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all",
                    status === "complete" && "bg-green-500 text-white",
                    status === "current" && "bg-blue-500 text-white ring-4 ring-blue-500/20",
                    status === "upcoming" && (isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-500")
                  )}
                >
                  {status === "complete" ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </div>
                <div className={cn(
                  "mt-2 text-xs font-medium",
                  status === "current" && "text-blue-500",
                  status === "complete" && "text-green-500",
                  status === "upcoming" && "text-slate-400"
                )}>
                  {step.label}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-1 mx-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      status === "complete" ? "bg-green-500" : isDark ? "bg-slate-700" : "bg-slate-200"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>
            Step {currentStep} of {STEPS.length}
          </span>
          <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
            {STEPS[currentStep - 1].label}
          </span>
        </div>
        <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-slate-200")}>
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

