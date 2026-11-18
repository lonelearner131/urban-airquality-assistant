import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePlan } from "@/hooks/usePlan";
import type { ProfileInput } from "@/schemas/profile";

const MOCK_PROFILE: ProfileInput = {
  locationName: "New Delhi",
  countryCode: "IN",
  latitude: 28.61,
  longitude: 77.21,
  household: {
    hasChildren: true,
    hasElderly: false,
    hasPregnancy: false,
    hasRespiratoryCondition: false,
  },
  commuteMode: "two-wheeler",
  commuteHoursPerDay: 1,
  cookingFuel: "lpg",
  heatingMethod: "none",
  ownsPurifier: "none",
  ventilationHabit: "closed",
  budgetLevel: "low",
  outdoorRoutine: {
    hasSchoolRun: true,
    morningWalk: false,
    vigorousExercise: false,
  },
  preferredLanguage: "en",
};

describe("usePlan Hook", () => {
  it("initializes with idle state and successfully fetches plan", async () => {
    const mockPlan = { locationName: "New Delhi", computedAqi: { value: 300 } };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlan,
    });

    const { result } = renderHook(() => usePlan());
    expect(result.current.plan).toBeNull();
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.fetchPlan(MOCK_PROFILE);
    });

    expect(result.current.plan).toEqual(mockPlan);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch failure gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server exploded" }),
    });

    const { result } = renderHook(() => usePlan());

    await act(async () => {
      await result.current.fetchPlan(MOCK_PROFILE);
    });

    expect(result.current.plan).toBeNull();
    expect(result.current.error).toBe("Server exploded");
    expect(result.current.isLoading).toBe(false);
  });
});
