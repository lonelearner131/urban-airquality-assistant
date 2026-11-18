import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ImpactPanel } from "@/components/ImpactPanel";
import type { ExposureEstimate } from "@/domain/types";

describe("ImpactPanel", () => {
  const fakeExposure: ExposureEstimate = {
    baselineUgM3h: 3200,
    withPlanUgM3h: 960,
    reductionPct: 70,
    baselineCigarettesDay: 6.8,
    withPlanCigarettesDay: 2.0,
    co2SavedKg: 2.4,
  };

  it("renders exposure metrics and cigarette equivalence", () => {
    render(
      <ImpactPanel
        exposure={fakeExposure}
        impactNarrative="Following this plan reduces particulate exposure significantly."
      />,
    );

    expect(screen.getByText("-70%")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/was 6.8/)).toBeInTheDocument();
    expect(screen.getByText("2.4")).toBeInTheDocument();
    expect(screen.getByText(/22 µg\/m³ PM2.5 ≈ 1 cigarette/)).toBeInTheDocument();
  });

  it("passes automated accessibility checks with vitest-axe", async () => {
    const { container } = render(
      <ImpactPanel
        exposure={fakeExposure}
        impactNarrative="Following this plan reduces particulate exposure significantly."
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
