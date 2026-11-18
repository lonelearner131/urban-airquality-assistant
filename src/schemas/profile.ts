/**
 * @fileoverview Zod runtime schema for user profile validation.
 * Single source of truth for household demographics, lifestyle habits, and location context.
 */

import { z } from "zod";

/**
 * Rounds a coordinate to 2 decimal places (~1.1 km precision) to safeguard user geolocation privacy.
 */
export function roundCoordinate(coord: number): number {
  return Number(coord.toFixed(2));
}

export const CommuteModeSchema = z.enum([
  "walk",
  "cycle",
  "two-wheeler",
  "car",
  "bus",
  "metro",
  "carpool",
  "wfh",
]);

export const CookingFuelSchema = z.enum(["lpg", "induction", "biomass", "piped_gas", "electric"]);

export const HeatingMethodSchema = z.enum([
  "none",
  "electric_heater",
  "biomass_fire",
  "heat_pump",
  "central",
]);

export const PurifierOwnershipSchema = z.enum(["none", "hepa", "diy"]);

export const VentilationHabitSchema = z.enum(["closed", "open", "mixed"]);

export const BudgetLevelSchema = z.enum(["free", "low", "flexible"]);

export const PreferredLanguageSchema = z.enum(["en", "hi"]);

export const ProfileSchema = z.object({
  locationName: z
    .string()
    .trim()
    .min(2, "Location name must be at least 2 characters")
    .max(100, "Location name too long"),
  countryCode: z.string().trim().max(3).optional(),
  latitude: z.number().min(-90).max(90).transform(roundCoordinate),
  longitude: z.number().min(-180).max(180).transform(roundCoordinate),
  household: z.object({
    hasChildren: z.boolean(),
    hasElderly: z.boolean(),
    hasPregnancy: z.boolean(),
    hasRespiratoryCondition: z.boolean(),
  }),
  commuteMode: CommuteModeSchema,
  commuteHoursPerDay: z.number().min(0).max(12).default(1),
  cookingFuel: CookingFuelSchema,
  heatingMethod: HeatingMethodSchema.default("none"),
  ownsPurifier: PurifierOwnershipSchema,
  ventilationHabit: VentilationHabitSchema,
  budgetLevel: BudgetLevelSchema,
  outdoorRoutine: z.object({
    hasSchoolRun: z.boolean().default(false),
    morningWalk: z.boolean().default(false),
    vigorousExercise: z.boolean().default(false),
  }),
  preferredLanguage: PreferredLanguageSchema.default("en"),
});

export type ProfileInput = z.input<typeof ProfileSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
