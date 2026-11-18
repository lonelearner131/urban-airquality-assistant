import type { AiNarrative } from "@/schemas/plan";
import type { Profile } from "@/schemas/profile";

function buildHindiNarrative(
  location: string,
  aqi: number,
  tier: string,
  cleanWindow: string,
  pctReduction: number,
): AiNarrative {
  return {
    headline: `${location} के लिए वायु गुणवत्ता सुरक्षा योजना (AQI ${aqi} - ${tier})`,
    plainSummary: `आपके क्षेत्र में प्रदूषण स्तर ${aqi} है। यह कार्ययोजना आपके परिवार के श्वसन जोखिम को ${pctReduction}% तक कम करने के लिए तैयार की गई है।`,
    timelineSteps: [
      {
        timeSlot: "morning",
        title: "सुबह का समय",
        instruction: "सुबह के समय खिड़कियां बंद रखें और N95 मास्क पहनें।",
      },
      {
        timeSlot: "afternoon",
        title: "दोपहर का समय",
        instruction: `सबसे साफ समय (${cleanWindow}) में 15 मिनट के लिए वेंटिलेट करें।`,
      },
      {
        timeSlot: "evening",
        title: "शाम व रात",
        instruction: "सोने से पूर्व बेडरूम का दरवाजा बंद रखें और एयर प्यूरीफायर चालू करें।",
      },
    ],
    indoorHacksNarrative: ["गीले पोछे से सफाई करें", "खाना बनाते समय एग्जॉस्ट चलाएं"],
    sustainableAlternativesNarrative: [
      "निजी वाहन के स्थान पर मेट्रो का उपयोग करें",
      "इंडक्शन कुकिंग अपनाएं",
    ],
    communityAdvisoryNarrative:
      "आसपास कूड़ा जलाने की घटनाओं को RWA और नगर निगम में तुरंत रिपोर्ट करें।",
    impactExplainedSimply: `इस योजना का पालन करने से दैनिक प्रदूषण एक्सपोजर में ${pctReduction}% की कमी आएगी।`,
  };
}

function buildEnglishNarrative(
  location: string,
  aqi: number,
  tier: string,
  cleanWindow: string,
  pctReduction: number,
): AiNarrative {
  return {
    headline: `Actionable Smog Shield Plan for ${location} (AQI ${aqi} - ${tier})`,
    plainSummary: `Ambient air quality is currently ${aqi} (${tier} risk). Following this targeted schedule reduces personal inhaled particulate dose by ${pctReduction}%.`,
    timelineSteps: [
      {
        timeSlot: "morning",
        title: "Morning Rush",
        instruction:
          "Keep windows sealed during dawn smog peaks. Wear a fitted N95 respirator outdoors.",
      },
      {
        timeSlot: "afternoon",
        title: "Midday Window",
        instruction: `Safely ventilate living areas during the cleanest daytime window (${cleanWindow}).`,
      },
      {
        timeSlot: "evening",
        title: "Evening & Sleep",
        instruction:
          "Seal bedroom and operate HEPA/box-fan filtration overnight to restore clean air.",
      },
    ],
    indoorHacksNarrative: [
      "Wet-mop floors instead of dry broom sweeping to avoid aerosol resuspension.",
      "Seal door sweeps and window gaps.",
    ],
    sustainableAlternativesNarrative: [
      "Switch personal vehicle trips to electrified Metro transit.",
      "Adopt electric induction cooking.",
    ],
    communityAdvisoryNarrative:
      "Coordinate with neighborhood RWA to enforce zero open waste burning and organize school van pools.",
    impactExplainedSimply: `By applying filtration, timing ventilation, and wearing N95 masks, you reduce your daily inhaled PM2.5 dose by ${pctReduction}%.`,
  };
}

export function buildDeterministicNarrative(
  location: string,
  aqi: number,
  tier: string,
  cleanWindow: string,
  lang: "en" | "hi",
  pctReduction: number,
): AiNarrative {
  return lang === "hi"
    ? buildHindiNarrative(location, aqi, tier, cleanWindow, pctReduction)
    : buildEnglishNarrative(location, aqi, tier, cleanWindow, pctReduction);
}

export function extractVulnerableGroupLabels(household: Profile["household"]): string[] {
  const groups: string[] = [];
  if (household.hasChildren) groups.push("children");
  if (household.hasElderly) groups.push("elderly");
  if (household.hasPregnancy) groups.push("pregnant");
  if (household.hasRespiratoryCondition) groups.push("respiratory");
  return groups;
}
