/**
 * @fileoverview Zod runtime validation for Open-Meteo Air Quality and Geocoding API responses.
 * Guarantees schema adherence before data enters domain calculation layers.
 */

import { z } from "zod";

export const OpenMeteoHourlyAirQualitySchema = z.object({
  time: z.array(z.string()),
  pm2_5: z.array(z.number().nullable()).default([]),
  pm10: z.array(z.number().nullable()).default([]),
  nitrogen_dioxide: z.array(z.number().nullable()).default([]),
  ozone: z.array(z.number().nullable()).default([]),
  us_aqi: z.array(z.number().nullable()).default([]),
});

export const OpenMeteoCurrentAirQualitySchema = z.object({
  pm2_5: z.number().nullable().optional(),
  pm10: z.number().nullable().optional(),
  nitrogen_dioxide: z.number().nullable().optional(),
  ozone: z.number().nullable().optional(),
  us_aqi: z.number().nullable().optional(),
});

export const OpenMeteoAirQualityResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
  current: OpenMeteoCurrentAirQualitySchema.nullable().optional(),
  hourly: OpenMeteoHourlyAirQualitySchema,
});

export type OpenMeteoAirQualityResponse = z.infer<typeof OpenMeteoAirQualityResponseSchema>;

export const GeocodeResultItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country_code: z.string().optional(),
  country: z.string().optional(),
  admin1: z.string().optional(),
});

export const GeocodeResponseSchema = z.object({
  results: z.array(GeocodeResultItemSchema).default([]),
});

export type GeocodeResultItem = z.infer<typeof GeocodeResultItemSchema>;
export type GeocodeResponse = z.infer<typeof GeocodeResponseSchema>;
