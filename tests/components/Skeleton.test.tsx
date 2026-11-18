import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/Skeleton";

describe("Skeleton Component", () => {
  it("renders with base animation classes", () => {
    const { container } = render(<Skeleton className="h-6 w-24" />);
    const skeletonDiv = container.firstChild as HTMLElement;
    expect(skeletonDiv.className).toContain("animate-pulse");
  });
});
