import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ChatPanel } from "@/components/ChatPanel";

describe("ChatPanel Component", () => {
  it("renders chat header, quick prompt buttons, and question input", () => {
    render(
      <ChatPanel
        locationName="New Delhi"
        aqi={320}
        riskTier="Severe"
        summary="Air quality is severe"
        language="en"
      />,
    );

    expect(screen.getByRole("region", { name: "Air Quality Assistant Q&A" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask a question about your air quality..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("submits a user message and displays the assistant reply", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Wear a certified N95 mask outdoors." }),
    });

    render(
      <ChatPanel
        locationName="New Delhi"
        aqi={320}
        riskTier="Severe"
        summary="Air quality is severe"
        language="en"
      />,
    );

    const input = screen.getByPlaceholderText("Ask a question about your air quality...");
    fireEvent.change(input, { target: { value: "What mask should I wear?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(screen.getByText("Wear a certified N95 mask outdoors.")).toBeInTheDocument();
    });
  });

  it("triggers query when quick prompt is clicked", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Children should avoid outdoor play during severe AQI." }),
    });

    render(
      <ChatPanel
        locationName="New Delhi"
        aqi={320}
        riskTier="Severe"
        summary="Air quality is severe"
        language="en"
      />,
    );

    const quickPrompt = screen.getByText("Is it safe for children to play outdoors today?");
    fireEvent.click(quickPrompt);

    await waitFor(() => {
      expect(
        screen.getByText("Children should avoid outdoor play during severe AQI."),
      ).toBeInTheDocument();
    });
  });

  it("passes accessibility checks with vitest-axe", async () => {
    const { container } = render(
      <ChatPanel
        locationName="New Delhi"
        aqi={320}
        riskTier="Severe"
        summary="Air quality is severe"
        language="en"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
