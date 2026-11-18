import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { IndoorHacks } from "@/components/IndoorHacks";
import { RULE_CATALOGUE } from "@/domain/recommendations/rules";

describe("IndoorHacks Component", () => {
  it("renders hacks list and applicable indoor rules", () => {
    const mockHacks = ["Wet-mop floors daily", "Seal window weatherstripping"];
    render(<IndoorHacks hacks={mockHacks} rules={RULE_CATALOGUE} language="en" />);

    expect(screen.getByRole("region", { name: "Indoor Air Quality Hacks" })).toBeInTheDocument();
    expect(screen.getByText("Wet-mop floors daily")).toBeInTheDocument();
    expect(screen.getByText("Seal window weatherstripping")).toBeInTheDocument();
  });

  it("passes accessibility checks with vitest-axe", async () => {
    const { container } = render(
      <IndoorHacks hacks={["Wet-mop floors"]} rules={RULE_CATALOGUE} language="en" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
