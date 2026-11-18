import type { LocationSelection } from "./LocationSearch";
import type { ProfileInput } from "@/schemas/profile";

export interface ProfileFormState {
  readonly location: LocationSelection;
  readonly commuteMode: ProfileInput["commuteMode"];
  readonly cookingFuel: ProfileInput["cookingFuel"];
  readonly heatingMethod: NonNullable<ProfileInput["heatingMethod"]>;
  readonly ownsPurifier: ProfileInput["ownsPurifier"];
  readonly ventilation: ProfileInput["ventilationHabit"];
  readonly budget: ProfileInput["budgetLevel"];
  readonly hasChildren: boolean;
  readonly hasElderly: boolean;
  readonly hasPregnancy: boolean;
  readonly hasRespiratory: boolean;
  readonly schoolRun: boolean;
  readonly morningWalk: boolean;
  readonly exercise: boolean;
}

export const DEFAULT_LOCATION: LocationSelection = {
  name: "New Delhi, Delhi, India",
  countryCode: "IN",
  lat: 28.61,
  lon: 77.21,
};

export const INITIAL_FORM_STATE: ProfileFormState = {
  location: DEFAULT_LOCATION,
  commuteMode: "two-wheeler",
  cookingFuel: "lpg",
  heatingMethod: "none",
  ownsPurifier: "none",
  ventilation: "closed",
  budget: "low",
  hasChildren: true,
  hasElderly: false,
  hasPregnancy: false,
  hasRespiratory: false,
  schoolRun: true,
  morningWalk: false,
  exercise: false,
};

export const COMMUTE_OPTIONS: { value: ProfileInput["commuteMode"]; label: string }[] = [
  { value: "two-wheeler", label: "Motorcycle / Scooter" },
  { value: "walk", label: "Walking" },
  { value: "cycle", label: "Bicycle" },
  { value: "car", label: "Personal Car" },
  { value: "bus", label: "Public Bus" },
  { value: "metro", label: "Electric Metro / Train" },
  { value: "carpool", label: "Carpool / Van" },
  { value: "wfh", label: "Work From Home (WFH)" },
];

export const COOKING_OPTIONS: { value: ProfileInput["cookingFuel"]; label: string }[] = [
  { value: "lpg", label: "LPG Gas Cylinder" },
  { value: "induction", label: "Electric Induction" },
  { value: "piped_gas", label: "Piped Natural Gas (PNG)" },
  { value: "biomass", label: "Biomass / Wood / Coal" },
  { value: "electric", label: "Electric Coil / Hotplate" },
];

export const HEATING_OPTIONS: {
  value: NonNullable<ProfileInput["heatingMethod"]>;
  label: string;
}[] = [
  { value: "none", label: "No space heating" },
  { value: "electric_heater", label: "Electric blower / Oil heater" },
  { value: "biomass_fire", label: "Wood / Fireplace / Angithi / Coal" },
  { value: "heat_pump", label: "Heat Pump / AC Heater" },
  { value: "central", label: "Central Heating" },
];

export const PURIFIER_OPTIONS: { value: ProfileInput["ownsPurifier"]; label: string }[] = [
  { value: "none", label: "None currently owned" },
  { value: "hepa", label: "Commercial HEPA Purifier" },
  { value: "diy", label: "DIY Box Fan / Filter" },
];

export const VENTILATION_OPTIONS: { value: ProfileInput["ventilationHabit"]; label: string }[] = [
  { value: "closed", label: "Windows closed all day" },
  { value: "mixed", label: "Open only during clean hours" },
  { value: "open", label: "Windows kept open" },
];

export const BUDGET_OPTIONS: { value: ProfileInput["budgetLevel"]; label: string }[] = [
  { value: "free", label: "Zero-Cost Only" },
  { value: "low", label: "Low Budget (< ₹2,500 / $30)" },
  { value: "flexible", label: "Flexible Budget" },
];

export function toProfileInput(s: ProfileFormState, language: "en" | "hi"): ProfileInput {
  return {
    locationName: s.location.name,
    countryCode: s.location.countryCode,
    latitude: s.location.lat,
    longitude: s.location.lon,
    household: {
      hasChildren: s.hasChildren,
      hasElderly: s.hasElderly,
      hasPregnancy: s.hasPregnancy,
      hasRespiratoryCondition: s.hasRespiratory,
    },
    commuteMode: s.commuteMode,
    commuteHoursPerDay: 1.5,
    cookingFuel: s.cookingFuel,
    heatingMethod: s.heatingMethod,
    ownsPurifier: s.ownsPurifier,
    ventilationHabit: s.ventilation,
    budgetLevel: s.budget,
    outdoorRoutine: {
      hasSchoolRun: s.schoolRun,
      morningWalk: s.morningWalk,
      vigorousExercise: s.exercise,
    },
    preferredLanguage: language,
  };
}
