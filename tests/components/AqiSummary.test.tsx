import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AqiSummary } from "@/components/AqiSummary";
import type { ComputedAqi, RiskAssessment } from "@/domain/types";

describe("AqiSummary", () => {
  const fakeAqi: ComputedAqi = {
    value: 285,
    scale: "INDIA_NAQI",
    dominantPollutant: "pm2_5",
    pm25: 140,
    pm10: 220,
    category: {
      band: "POOR",
      label: "Poor",
      hindiLabel: "खराब",
      color: "text-orange-800",
      iconName: "ShieldAlert",
      generalAdvisory: "Breathing discomfort to most people on prolonged outdoor exposure.",
    },
  };

  const fakeRisk: RiskAssessment = {
    tier: "HIGH",
    score: 380,
    multiplier: 1.35,
    rationale: "Elevated risk due to presence of: Children.",
    rationaleHindi: "बच्चों की उपस्थिति के कारण उच्च जोखिम।",
    vulnerableGroupsIdentified: ["Children"],
  };

  it("renders AQI hero value, category, and risk tier", () => {
    render(
      <AqiSummary
        computedAqi={fakeAqi}
        riskAssessment={fakeRisk}
        locationName="New Delhi, India"
        isAiGenerated={true}
      />,
    );

    expect(screen.getByText("285")).toBeInTheDocument();
    expect(screen.getByText("Poor")).toBeInTheDocument();
    expect(screen.getByText("HIGH RISK (1.35x)")).toBeInTheDocument();
    expect(screen.getByText(/Elevated risk due to presence of: Children/)).toBeInTheDocument();
  });

  it("shows offline smart-rules mode badge when isAiGenerated is false", () => {
    render(
      <AqiSummary
        computedAqi={fakeAqi}
        riskAssessment={fakeRisk}
        locationName="New Delhi, India"
        isAiGenerated={false}
      />,
    );

    expect(screen.getByText("Offline smart-rules mode")).toBeInTheDocument();
  });

  it("passes automated accessibility checks with vitest-axe", async () => {
    const { container } = render(
      <AqiSummary
        computedAqi={fakeAqi}
        riskAssessment={fakeRisk}
        locationName="New Delhi, India"
        isAiGenerated={true}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
