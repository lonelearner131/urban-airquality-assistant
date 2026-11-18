/**
 * @fileoverview Deterministic recommendation rule catalogue.
 * Rules are structured data, avoiding if/else sprawl. Each rule contains
 * verified exposure reduction percentages, emission savings, and peer-reviewed citations.
 */

import { EMISSION_SAVINGS_KG_CO2 } from "@/domain/constants";
import type { RecommendationRule } from "@/domain/types";

const ROUTINE_AND_INDOOR_RULES: readonly RecommendationRule[] = [
  {
    id: "routine_shift_school_run",
    category: "routine",
    title: "Shift morning departure and school run to cleanest window",
    titleHindi: "सुबह के प्रस्थान और स्कूल के समय को सबसे स्वच्छ समय स्लॉट में स्थानांतरित करें",
    description:
      "Diurnal winter inversions trap pollutants near ground level at dawn. Delaying departures by 45-60 minutes avoids peak particulate concentrations.",
    descriptionHindi:
      "सर्दियों में सुबह के समय जमीन के पास प्रदूषण सर्वाधिक होता है। प्रस्थान में 45-60 मिनट का समायोजन विषैले कणों से बचाता है।",
    effort: "free",
    exposureReductionPct: 35,
    citation:
      "Guttikunda et al. (2014) Atmospheric Environment: Diurnal variability of PM2.5 in Indian megacities.",
    conditions: { minAqi: 120, vulnerabilityRequired: true },
  },
  {
    id: "routine_mask_commute",
    category: "routine",
    title: "Wear certified N95 / FFP2 respirator for outdoor & two-wheeler transit",
    titleHindi: "सड़क व दोपहिया यात्रा के दौरान प्रमाणित N95 / FFP2 मास्क पहनें",
    description:
      "Cloth and surgical masks offer sub-30% filtration for fine aerosols. A snug-fitting N95 respirator stops >90% of PM2.5 particles.",
    descriptionHindi:
      "साधारण कपड़ा मास्क PM2.5 को नहीं रोकता। सही फिटिंग वाला N95 मास्क 90% से अधिक हानिकारक कणों को रोकता है।",
    effort: "low",
    exposureReductionPct: 85,
    citation:
      "Shakya et al. (2017) Journal of Exposure Science: Real-world filtration efficiency of respirators.",
    conditions: {
      minAqi: 100,
      commuteModes: ["two-wheeler", "walk", "cycle", "bus", "carpool"],
    },
  },
  {
    id: "indoor_bedroom_purifier",
    category: "indoor",
    title: "Target HEPA purifier in sealed bedroom during sleep hours",
    titleHindi: "सोते समय एयर प्यूरीफायर को बंद बेडरूम में चलाएं",
    description:
      "Humans spend 33% of daily life sleeping. Operating a HEPA purifier in a closed bedroom drops nighttime exposure to near-WHO safe thresholds.",
    descriptionHindi:
      "हम दिन का एक तिहाई समय सोने में बिताते हैं। बंद कमरे में प्यूरीफायर चलाने से रात का प्रदूषण स्तर सुरक्षित सीमा में आ जाता है।",
    effort: "free",
    exposureReductionPct: 65,
    citation:
      "Sublett (2011) Curr Allergy Asthma Rep: Effectiveness of air filtration in residential bedrooms.",
    conditions: { minAqi: 80, purifierStatus: ["hepa", "diy"] },
  },
  {
    id: "indoor_diy_corsirosenthal",
    category: "indoor",
    title: "Construct a DIY Corsi-Rosenthal Box / Fan Purifier",
    titleHindi: "कम बजट में DIY बॉक्स फैन और MERV-13 फिल्टर प्यूरीफायर बनाएं",
    description:
      "A standard 20-inch box fan paired with a MERV-13 / HEPA furnace filter achieves Clean Air Delivery Rates (CADR) comparable to commercial purifiers at 15% cost.",
    descriptionHindi:
      "एक सामान्य बॉक्स फैन और MERV-13/HEPA फिल्टर जोड़कर कम लागत में उच्च क्षमता वाला एयर क्लीनर तैयार किया जा सकता है।",
    effort: "low",
    exposureReductionPct: 60,
    citation:
      "Dal Porto et al. (2022) Aerosol Sci Tech: Characterizing the performance of Corsi-Rosenthal boxes.",
    conditions: {
      minAqi: 100,
      purifierStatus: ["none"],
      budgetLevels: ["free", "low"],
    },
  },
  {
    id: "indoor_timed_ventilation",
    category: "indoor",
    title: "Seal envelope during morning peaks; flash-ventilate at cleanest hour",
    titleHindi: "सुबह के पीक समय खिड़कियां बंद रखें; सबसे साफ घंटे में 15 मिनट वेंटिलेट करें",
    description:
      "Avoid opening windows during morning and evening rush-hour smog peaks. Venting for 15 minutes during the afternoon trough refreshes oxygen while minimizing PM2.5 infiltration.",
    descriptionHindi:
      "सुबह और शाम खिड़कियां बंद रखें। दोपहर के समय जब वायु सबसे साफ हो, केवल 15 मिनट के लिए ताजा हवा आने दें।",
    effort: "free",
    exposureReductionPct: 25,
    citation:
      "Chen & Zhao (2011) Building and Environment: Infiltration and ventilation strategies for urban residences.",
    conditions: { minAqi: 120 },
  },
  {
    id: "indoor_wet_mopping",
    category: "indoor",
    title: "Wet-mop living areas; avoid dry sweeping that resuspends settled dust",
    titleHindi: "सूखी झाड़ू के बजाय गीला पोछा लगाएं ताकि जमा धूल दोबारा हवा में न उड़े",
    description:
      "Dry broom sweeping propels fine settled particulates into breathing zones for 2-3 hours. Wet microfiber mopping permanently traps settled aerosols.",
    descriptionHindi:
      "सूखी झाड़ू से धूल के कण घंटों हवा में तैरते रहते हैं। गीले पोंछे से सफाई करने पर धूल हवा में नहीं उड़ती।",
    effort: "free",
    exposureReductionPct: 15,
    citation:
      "Ferro et al. (2004) Indoor Air: Indoor indoor particle resuspension dynamics from human activity.",
    conditions: { minAqi: 80 },
  },
];

const SUSTAINABLE_AND_COMMUNITY_RULES: readonly RecommendationRule[] = [
  {
    id: "sustainable_induction_cooking",
    category: "sustainable",
    title: "Transition cooking to electric induction to eliminate indoor NOx and CO",
    titleHindi: "इंडोर धुएं और गैस से बचने के लिए इलेक्ट्रिक इंडक्शन कुकिंग अपनाएं",
    description:
      "Solid fuel biomass and gas burners emit ultrafine particulates and toxic nitrogen dioxide (NO2). Induction eliminates all indoor combustion emissions.",
    descriptionHindi:
      "लकड़ी, उपले या गैस से निकलने वाली जहरीली गैसें फेफड़ों को नुकसान पहुंचाती हैं। इंडक्शन चूल्हा पूरी तरह सुरक्षित है।",
    effort: "flexible",
    exposureReductionPct: 30,
    emissionSavedKgCo2: EMISSION_SAVINGS_KG_CO2.INDUCTION_VS_BIOMASS,
    citation: "WHO (2014) Indoor Air Quality Guidelines: Household fuel combustion.",
    conditions: { cookingFuels: ["biomass", "wood", "kerosene", "lpg"] },
  },
  {
    id: "sustainable_metro_commute",
    category: "sustainable",
    title: "Shift personal vehicle / two-wheeler commute to electric metro rail",
    titleHindi: "निजी वाहन के स्थान पर मेट्रो ट्रेन का उपयोग करें",
    description:
      "Riding underground or elevated electrified transit bypasses street-level tailpipe exhaust plumes and saves over 2 kg of CO2 daily.",
    descriptionHindi:
      "मेट्रो की यात्रा सड़क पर मौजूद प्रत्यक्ष जहरीले धुएं से बचाती है और पर्यावरण में कार्बन उत्सर्जन को घटाती है।",
    effort: "low",
    exposureReductionPct: 45,
    emissionSavedKgCo2: EMISSION_SAVINGS_KG_CO2.METRO_VS_CAR_COMMUTE,
    citation: "IPCC (2022) Climate Change Mitigation: Urban passenger transport decarbonization.",
    conditions: {
      minAqi: 100,
      commuteModes: ["car", "two-wheeler"],
    },
  },
  {
    id: "community_anti_waste_burning",
    category: "community",
    title: "Institute community zero-tolerance protocol for open waste & leaf burning",
    titleHindi: "कूड़ा और पत्ते जलाने पर पूर्ण प्रतिबंध लगाएं तथा RWA के साथ रिपोर्ट करें",
    description:
      "Open biomass combustion produces high concentrations of polycyclic aromatic hydrocarbons (PAHs). Organizing neighbourhood reporting keeps perimeter air breathable.",
    descriptionHindi:
      "कूड़ा जलाने से अत्यधिक जहरीला धुआं उत्पन्न होता है। समुदाय में निगरानी रखें और नियमों का पालन सुनिश्चित कराएं।",
    effort: "free",
    exposureReductionPct: 20,
    emissionSavedKgCo2: EMISSION_SAVINGS_KG_CO2.AVOID_WASTE_BURNING,
    citation:
      "Kumar et al. (2015) Atmospheric Environment: Biomass burning emissions in urban South Asia.",
    conditions: { minAqi: 140 },
  },
  {
    id: "community_carpool_school_bus",
    category: "community",
    title: "Coordinate neighbourhood school carpools to eliminate idling gridlock",
    titleHindi: "स्कूल के लिए पड़ोसियों के साथ कारपूलिंग या स्कूल बस का उपयोग करें",
    description:
      "School drop-off zones exhibit peak PM2.5 spikes due to clustered vehicle idling. Group carpooling cuts localized gate-side emissions by up to 50%.",
    descriptionHindi:
      "स्कूल गेट के बाहर सैकड़ों गाड़ियों के स्टार्ट रहने से तीव्र प्रदूषण होता है। साझा वाहन से इसे आधा किया जा सकता है।",
    effort: "low",
    exposureReductionPct: 25,
    emissionSavedKgCo2: EMISSION_SAVINGS_KG_CO2.SCHOOL_CARPOOL,
    citation:
      "Levy et al. (2001) Environmental Health Perspectives: Vehicle idling around urban school zones.",
    conditions: { minAqi: 120, vulnerabilityRequired: true },
  },
];

export const RULE_CATALOGUE: readonly RecommendationRule[] = [
  ...ROUTINE_AND_INDOOR_RULES,
  ...SUSTAINABLE_AND_COMMUNITY_RULES,
];
