import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Header } from "@/components/Header";

describe("Header Component", () => {
  it("renders app branding and triggers language toggle", () => {
    const onLanguageChange = vi.fn();
    render(<Header language="en" onLanguageChange={onLanguageChange} />);

    expect(screen.getByText("Urban Air Quality & Smog Assistant")).toBeInTheDocument();
    const hindiButton = screen.getByText("हिन्दी");
    fireEvent.click(hindiButton);

    expect(onLanguageChange).toHaveBeenCalledWith("hi");
  });
});
