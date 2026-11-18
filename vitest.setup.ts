import "@testing-library/jest-dom";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { AxeMatchers } from "vitest-axe/matchers";
import { expect, vi } from "vitest";
import * as matchers from "vitest-axe/matchers";

expect.extend(matchers);

declare module "vitest" {
  interface Assertion<R extends void | Promise<void> = void, T = unknown>
    extends TestingLibraryMatchers<unknown, T>, AxeMatchers {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<unknown, unknown>, AxeMatchers {}
}

vi.mock("server-only", () => ({}));
