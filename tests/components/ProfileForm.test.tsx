import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ProfileForm } from "@/components/ProfileForm";

describe("ProfileForm", () => {
  it("renders form controls with accessible labels", () => {
    const handleSubmit = vi.fn();
    render(<ProfileForm onSubmit={handleSubmit} />);

    expect(screen.getByRole("form")).toBeInTheDocument();
    expect(screen.getByLabelText(/city or neighborhood/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/primary commute mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cooking fuel/i)).toBeInTheDocument();
  });

  it("submits profile input on button click", () => {
    const handleSubmit = vi.fn();
    render(<ProfileForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole("button", { name: /generate action plan/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submitted = handleSubmit.mock.calls[0]?.[0];
    expect(submitted.locationName).toBeDefined();
    expect(submitted.household).toBeDefined();
  });

  it("passes automated accessibility checks with vitest-axe", async () => {
    const { container } = render(<ProfileForm onSubmit={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
