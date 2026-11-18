import { describe, expect, it } from "vitest";
import { answerAirQualityChat, generateAiPlanNarrative } from "@/services/gemini";

describe("gemini service", () => {
  const fakeFacts = {
    locationName: "New Delhi",
    aqi: 280,
    aqiBand: "Poor",
    riskTier: "High",
    vulnerableGroups: ["Children"],
    cleanestTimeWindow: "13:00 - 15:00",
    worstTimeWindow: "07:00",
    exposureReductionPct: 65,
    cigaretteReduction: { from: 8.2, to: 2.1 },
    selectedRuleIds: ["routine_mask_commute"],
    language: "en" as const,
  };

  it("parses valid AI narrative successfully with injected generator", async () => {
    const validNarrative = {
      headline: "Protective Plan for New Delhi",
      plainSummary: "Air quality is poor. Reduce outdoor time and wear N95 masks.",
      timelineSteps: [
        {
          timeSlot: "morning",
          title: "Commute",
          instruction: "Wear N95 mask outdoors.",
          referencedRuleId: "r1",
        },
        {
          timeSlot: "afternoon",
          title: "Ventilation",
          instruction: "Open windows for 15 minutes.",
        },
        { timeSlot: "evening", title: "Purifier", instruction: "Run bedroom purifier all night." },
      ],
      indoorHacksNarrative: ["Wet mop instead of sweep"],
      sustainableAlternativesNarrative: ["Ride metro instead of driving"],
      communityAdvisoryNarrative: "Coordinate school bus pools and report open burning.",
      impactExplainedSimply: "Following this plan cuts inhaled particulates by 65%.",
    };

    const fakeGenerator = async () => JSON.stringify(validNarrative);
    const result = await generateAiPlanNarrative(fakeFacts, fakeGenerator);

    expect(result).not.toBeNull();
    expect(result?.headline).toBe("Protective Plan for New Delhi");
  });

  it("returns null when AI generator returns invalid schema", async () => {
    const invalidNarrative = { invalidField: true };
    const fakeGenerator = async () => JSON.stringify(invalidNarrative);

    const result = await generateAiPlanNarrative(fakeFacts, fakeGenerator);
    expect(result).toBeNull();
  });

  it("answers air quality chat using injected generator", async () => {
    const fakeGenerator = async () => "N95 masks are strongly recommended when AQI exceeds 200.";
    const answer = await answerAirQualityChat(
      {
        userQuestion: "Should my child wear a mask to school today?",
        aqi: 280,
        riskTier: "High",
        locationName: "Delhi",
        planSummary: "High smog",
        language: "en",
      },
      fakeGenerator,
    );

    expect(answer).toContain("N95");
  });

  it("handles offline chat fallback in English and Hindi", async () => {
    const enReply = await answerAirQualityChat({
      locationName: "New Delhi",
      aqi: 280,
      riskTier: "High",
      planSummary: "High pollution advisory",
      userQuestion: "Should I wear a mask?",
      language: "en",
    });
    expect(enReply).toContain("AI assistant is currently offline");

    const hiReply = await answerAirQualityChat({
      locationName: "New Delhi",
      aqi: 280,
      riskTier: "High",
      planSummary: "High pollution advisory",
      userQuestion: "क्या मास्क पहनना चाहिए?",
      language: "hi",
    });
    expect(hiReply).toContain("AI सहायक वर्तमान में ऑफ़लाइन है");
  });

  it("handles chat error fallback in English and Hindi when generator throws", async () => {
    const errorGenerator = async () => {
      throw new Error("Quota exceeded");
    };

    const enError = await answerAirQualityChat(
      {
        locationName: "New Delhi",
        aqi: 280,
        riskTier: "High",
        planSummary: "High pollution advisory",
        userQuestion: "Question?",
        language: "en",
      },
      errorGenerator,
    );
    expect(enError).toContain("Unable to retrieve answer");

    const hiError = await answerAirQualityChat(
      {
        locationName: "New Delhi",
        aqi: 280,
        riskTier: "High",
        planSummary: "High pollution advisory",
        userQuestion: "प्रश्न?",
        language: "hi",
      },
      errorGenerator,
    );
    expect(hiError).toContain("उत्तर प्राप्त करने में असमर्थ");
  });
});
