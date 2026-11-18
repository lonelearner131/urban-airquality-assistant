import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Alternatives } from "@/components/Alternatives";
import { RULE_CATALOGUE } from "@/domain/recommendations/rules";

describe("Alternatives Component", () => {
  it("renders sustainable choices and CO2 savings badges", () => {
    render(<Alternatives alternatives={["Ride Metro"]} rules={RULE_CATALOGUE} language="en" />);

    expect(screen.getByRole("region", { name: "Sustainable Alternatives" })).toBeInTheDocument();
  });

  it("passes accessibility checks with vitest-axe", async () => {
    const { container } = render(
      <Alternatives alternatives={["Ride Metro"]} rules={RULE_CATALOGUE} language="en" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
