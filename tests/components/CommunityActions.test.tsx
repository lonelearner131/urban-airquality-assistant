import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { CommunityActions } from "@/components/CommunityActions";
import type { GrapAssessment } from "@/domain/types";

describe("CommunityActions", () => {
  const fakeGrap: GrapAssessment = {
    applicable: true,
    stage: 3,
    stageName: "GRAP Stage III ('Severe' Air Quality)",
    summary: "Mandatory curbs on private vehicles and outdoor activities.",
    citizenActions: ["Work from home if possible", "Stop non-essential construction"],
    officialVerificationNote: "Verify with CAQM at caqm.nic.in",
  };

  it("renders community advisory and GRAP stage notification", () => {
    render(
      <CommunityActions
        advisory="Please coordinate school carpooling and do not burn leaves."
        grap={fakeGrap}
        locationName="New Delhi"
      />,
    );

    expect(screen.getByText("GRAP Stage III ('Severe' Air Quality)")).toBeInTheDocument();
    expect(screen.getByText(/Please coordinate school carpooling/)).toBeInTheDocument();
  });

  it("copies broadcast notice to clipboard on click", async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy },
    });

    render(
      <CommunityActions advisory="Community alert" grap={fakeGrap} locationName="New Delhi" />,
    );

    const copyBtn = screen.getByRole("button", { name: /copy notice/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextSpy).toHaveBeenCalled();
  });

  it("passes automated accessibility checks with vitest-axe", async () => {
    const { container } = render(
      <CommunityActions
        advisory="Please coordinate school carpooling."
        grap={fakeGrap}
        locationName="New Delhi"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
