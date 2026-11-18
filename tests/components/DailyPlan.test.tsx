import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { DailyPlan } from "@/components/DailyPlan";
import type { AiNarrative } from "@/schemas/plan";

const MOCK_NARRATIVE: AiNarrative = {
  headline: "Delhi Smog Defense Plan",
  plainSummary:
    "Air quality is currently severe. Follow the three time-slot recommendations to limit particulate dose.",
  timelineSteps: [
    {
      timeSlot: "morning",
      title: "Morning Commute",
      instruction: "Wear an N95 respirator and keep windows closed.",
    },
    {
      timeSlot: "afternoon",
      title: "Ventilation Window",
      instruction: "Open windows briefly during the 13:00 cleanest air window.",
    },
    {
      timeSlot: "evening",
      title: "Bedroom Air Cleaning",
      instruction: "Run HEPA air purifier on medium-high in sleeping quarters.",
    },
  ],
  indoorHacksNarrative: ["Wet-mop floors", "Seal door draft gaps"],
  sustainableAlternativesNarrative: ["Take Delhi Metro", "Use induction cooktop"],
  communityAdvisoryNarrative: "Notify RWA regarding ban on open waste burning.",
  impactExplainedSimply: "Following this routine reduces inhaled dose by 45%.",
};

describe("DailyPlan Component", () => {
  it("renders daily schedule headline, summary, and all 3 time slots", () => {
    render(<DailyPlan narrative={MOCK_NARRATIVE} language="en" />);
    expect(screen.getByRole("region", { name: "Daily Low-Emission Plan" })).toBeInTheDocument();
    expect(screen.getByText("Delhi Smog Defense Plan")).toBeInTheDocument();
    expect(screen.getByText("Morning Commute")).toBeInTheDocument();
    expect(screen.getByText("Ventilation Window")).toBeInTheDocument();
    expect(screen.getByText("Bedroom Air Cleaning")).toBeInTheDocument();
  });

  it("passes accessibility checks with vitest-axe", async () => {
    const { container } = render(<DailyPlan narrative={MOCK_NARRATIVE} language="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
