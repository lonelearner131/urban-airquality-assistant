import { useState } from "react";
import type { CompletePlan } from "@/schemas/plan";
import type { ProfileInput } from "@/schemas/profile";

export function usePlan() {
  const [plan, setPlan] = useState<CompletePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async (profile: ProfileInput): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? `Request failed with status ${response.status}`);
      }

      const planData: CompletePlan = await response.json();
      setPlan(planData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate air quality plan");
    } finally {
      setIsLoading(false);
    }
  };

  return { plan, isLoading, error, fetchPlan };
}
