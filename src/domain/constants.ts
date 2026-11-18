/**
 * @fileoverview Domain constants with scientific, regulatory, and epidemiological citations.
 * These constants form the immutable baseline for exposure modeling, AQI classification,
 * risk scoring, and Delhi GRAP advisory stages.
 */

/**
 * World Health Organization (WHO) Global Air Quality Guidelines (2021).
 * Source: WHO (2021) "WHO global air quality guidelines: particulate matter (PM2.5 and PM10)".
 */
export const WHO_GUIDELINES = {
  /** 24-hour mean guideline for PM2.5 in ug/m3 */
  PM25_24HR_LIMIT_UG_M3: 15,
  /** Annual mean guideline for PM2.5 in ug/m3 */
  PM25_ANNUAL_LIMIT_UG_M3: 5,
} as const;

/**
 * Cigarette equivalence heuristic constant.
 * Source: Muller & Muller (2015), Berkeley Earth - "Air Pollution and Cigarette Equivalence".
 * Derived from the rule of thumb that 22 ug/m3 of PM2.5 over 24 hours delivers roughly
 * the same particulate dose as smoking 1 standard cigarette.
 */
export const CIGARETTE_EQUIVALENCE = {
  /** Equivalent ug/m3 PM2.5 24h exposure per 1 cigarette */
  UG_M3_PER_CIGARETTE: 22,
} as const;

/**
 * Central Pollution Control Board (CPCB) India National Air Quality Index (NAQI) breakpoints.
 * Source: CPCB (2014) "National Air Quality Index Report", Ministry of Environment, Forest & Climate Change.
 */
export const INDIA_NAQI_BREAKPOINTS = {
  GOOD: { minAqi: 0, maxAqi: 50, minPm25: 0, maxPm25: 30, minPm10: 0, maxPm10: 50 },
  SATISFACTORY: { minAqi: 51, maxAqi: 100, minPm25: 31, maxPm25: 60, minPm10: 51, maxPm10: 100 },
  MODERATE: { minAqi: 101, maxAqi: 200, minPm25: 61, maxPm25: 90, minPm10: 101, maxPm10: 250 },
  POOR: { minAqi: 201, maxAqi: 300, minPm25: 91, maxPm25: 120, minPm10: 251, maxPm10: 350 },
  VERY_POOR: { minAqi: 301, maxAqi: 400, minPm25: 121, maxPm25: 250, minPm10: 351, maxPm10: 430 },
  SEVERE: { minAqi: 401, maxAqi: 500, minPm25: 251, maxPm25: 500, minPm10: 431, maxPm10: 600 },
} as const;

/**
 * US EPA Air Quality Index (AQI) breakpoints for PM2.5 (ug/m3).
 * Source: US EPA (2024 revised) "Technical Assistance Document for the Reporting of Daily Air Quality".
 */
export const US_EPA_BREAKPOINTS = {
  GOOD: { minAqi: 0, maxAqi: 50, minPm25: 0.0, maxPm25: 12.0 },
  MODERATE: { minAqi: 51, maxAqi: 100, minPm25: 12.1, maxPm25: 35.4 },
  UNHEALTHY_SENSITIVE: { minAqi: 101, maxAqi: 150, minPm25: 35.5, maxPm25: 55.4 },
  UNHEALTHY: { minAqi: 151, maxAqi: 200, minPm25: 55.5, maxPm25: 150.4 },
  VERY_UNHEALTHY: { minAqi: 201, maxAqi: 300, minPm25: 150.5, maxPm25: 250.4 },
  HAZARDOUS: { minAqi: 301, maxAqi: 500, minPm25: 250.5, maxPm25: 500.4 },
} as const;

/**
 * Vulnerability weighting multipliers reflecting clinical susceptibility to PM2.5.
 * Sources:
 * - Children: higher minute ventilation per body weight (Bateson & Schwartz, 2008).
 * - Elderly: pre-existing endothelial dysfunction and cardiac reserve loss (Simkhovich et al., 2008).
 * - Pregnancy: placental trans-barrier transport and intrauterine growth restriction (Stieb et al., 2012).
 * - Respiratory: airway hyper-responsiveness in Asthma/COPD (Guarnieri & Balmes, 2014).
 */
export const VULNERABILITY_WEIGHTS = {
  BASELINE: 1.0,
  CHILDREN: 0.35,
  ELDERLY: 0.35,
  PREGNANT: 0.45,
  RESPIRATORY_CONDITION: 0.55,
  MAX_MULTIPLIER: 2.5,
} as const;

/**
 * Risk tier AQI thresholds based on India NAQI / US EPA equivalent bands.
 */
export const RISK_THRESHOLDS = {
  MODERATE_MIN_SCORE: 100,
  HIGH_MIN_SCORE: 200,
  SEVERE_MIN_SCORE: 350,
} as const;

/**
 * Building envelope infiltration and filtration coefficients.
 * Fraction of ambient outdoor particulate matter present indoors.
 * Sources:
 * - Infiltration in residential structures: Chen & Zhao (2011), Building and Environment.
 * - HEPA Purifier effectiveness: Sublett (2011), Curr Allergy Asthma Rep.
 * - DIY Corsi-Rosenthal Box: Dal Porto et al. (2022), Aerosol Science and Technology.
 */
export const INDOOR_FILTRATION_FACTORS = {
  /** Windows open or high natural ventilation without filtration */
  OPEN_VENTILATION: 0.85,
  /** Windows closed, normal residential envelope without active filtration */
  CLOSED_NO_FILTER: 0.6,
  /** Certified True HEPA purifier in closed room */
  HEPA_PURIFIER: 0.2,
  /** DIY Box Fan + MERV-13 / HEPA filter */
  DIY_PURIFIER: 0.35,
} as const;

/**
 * Personal protective equipment (mask) penetration factor.
 * Fraction of ambient particulate matter inhaled while wearing mask outdoors.
 * Source: Shakya et al. (2017), Journal of Exposure Science & Environmental Epidemiology.
 */
export const MASK_FACTORS = {
  NONE: 1.0,
  CLOTH_OR_SURGICAL: 0.7,
  N95_FFP2_FITTED: 0.1,
} as const;

/**
 * Human minute ventilation rate multipliers by activity level.
 * Baseline (1.0) normalized to light sedentary indoor activity (~0.5 - 0.6 m3/h).
 * Source: US EPA Exposure Factors Handbook (2011), Table 6-1.
 */
export const ACTIVITY_VENTILATION_FACTORS = {
  SLEEP: 0.75,
  LIGHT_INDOOR: 1.0,
  COMMUTE_OR_WALK: 2.0,
  VIGOROUS_OUTDOOR: 3.8,
} as const;

/**
 * Graded Response Action Plan (GRAP) trigger stages for Delhi-NCR.
 * Source: Commission for Air Quality Management (CAQM), Statutory Framework for Delhi-NCR.
 */
export const DELHI_GRAP_STAGES = {
  STAGE_1_MIN_AQI: 201,
  STAGE_2_MIN_AQI: 301,
  STAGE_3_MIN_AQI: 401,
  STAGE_4_MIN_AQI: 450,
} as const;

/**
 * Daily emissions reduction estimates (kg CO2 equivalent) for sustainable choices.
 * Source: IPCC AR6 WG3 (2022) Transport & Buildings mitigation tables.
 */
export const EMISSION_SAVINGS_KG_CO2 = {
  METRO_VS_CAR_COMMUTE: 2.4,
  METRO_VS_TWOWHEELER_COMMUTE: 0.8,
  INDUCTION_VS_BIOMASS: 3.2,
  INDUCTION_VS_LPG: 0.45,
  AVOID_WASTE_BURNING: 1.8,
  SCHOOL_CARPOOL: 1.5,
} as const;

/**
 * Cache and networking timeouts in milliseconds.
 */
export const NETWORK_CONFIG = {
  CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes
  HTTP_TIMEOUT_MS: 8000, // 8 seconds
  MAX_RETRIES: 1,
  COORDINATE_DECIMAL_PLACES: 2, // Privacy protection
} as const;
