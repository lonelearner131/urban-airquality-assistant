import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { HourlyChart } from "@/components/HourlyChart";
import type { HourlyPoint, WindowRecommendation } from "@/domain/types";

describe("HourlyChart", () => {
  const fakePoints: HourlyPoint[] = [
    {
      isoTime: "2026-11-18T00:00:00Z",
      hour: 0,
      pm25: 180,
      aqi: 240,
      isCleanest: false,
      isWorst: false,
    },
    {
      isoTime: "2026-11-18T07:00:00Z",
      hour: 7,
      pm25: 280,
      aqi: 340,
      isCleanest: false,
      isWorst: true,
    },
    {
      isoTime: "2026-11-18T14:00:00Z",
      hour: 14,
      pm25: 75,
      aqi: 150,
      isCleanest: true,
      isWorst: false,
    },
  ];

  const fakeWindows: WindowRecommendation = {
    cleanestHour: 14,
    cleanestIsoTime: "2026-11-18T14:00:00Z",
    cleanestPm25: 75,
    worstHour: 7,
    worstIsoTime: "2026-11-18T07:00:00Z",
    worstPm25: 280,
    safeWindows: [{ startHour: 13, endHour: 15, label: "13:00 - 15:00", averagePm25: 80 }],
  };

  it("renders SVG chart with accessible role and text summary", () => {
    render(<HourlyChart points={fakePoints} windows={fakeWindows} />);
    const svgChart = screen.getByRole("img");
    expect(svgChart).toBeInTheDocument();
    expect(svgChart).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Cleanest air is 75 µg/m³ at hour 14:00"),
    );
  });

  it("toggles accessible data table alternative", () => {
    render(<HourlyChart points={fakePoints} windows={fakeWindows} />);
    const toggleBtn = screen.getByRole("button", { name: /view accessible table/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Cleanest Window")).toBeInTheDocument();
  });

  it("passes automated accessibility checks with vitest-axe", async () => {
    const { container } = render(<HourlyChart points={fakePoints} windows={fakeWindows} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
