import { describe, expect, it } from "vitest";
import { IndiaNaqiScale } from "@/domain/aqi/indiaNaqiScale";
import { selectAqiScale } from "@/domain/aqi/selectScale";
import { UsEpaScale } from "@/domain/aqi/usEpaScale";

describe("IndiaNaqiScale", () => {
  const scale = new IndiaNaqiScale();

  const testCases = [
    { pm25: 15, expectedAqi: 25, band: "GOOD", label: "Good" },
    { pm25: 30, expectedAqi: 50, band: "GOOD", label: "Good" },
    { pm25: 45, expectedAqi: 76, band: "SATISFACTORY", label: "Satisfactory" },
    { pm25: 60, expectedAqi: 100, band: "SATISFACTORY", label: "Satisfactory" },
    { pm25: 75, expectedAqi: 151, band: "MODERATE", label: "Moderate" },
    { pm25: 90, expectedAqi: 200, band: "MODERATE", label: "Moderate" },
    { pm25: 105, expectedAqi: 251, band: "POOR", label: "Poor" },
    { pm25: 120, expectedAqi: 300, band: "POOR", label: "Poor" },
    { pm25: 185, expectedAqi: 351, band: "VERY_POOR", label: "Very Poor" },
    { pm25: 250, expectedAqi: 400, band: "VERY_POOR", label: "Very Poor" },
    { pm25: 375, expectedAqi: 451, band: "SEVERE", label: "Severe" },
    { pm25: 600, expectedAqi: 500, band: "SEVERE", label: "Severe" },
  ];

  it.each(testCases)(
    "computes PM2.5=$pm25 to AQI=$expectedAqi ($band)",
    ({ pm25, expectedAqi, band, label }) => {
      const res = scale.compute(pm25);
      expect(res.value).toBe(expectedAqi);
      expect(res.category.band).toBe(band);
      expect(res.category.label).toBe(label);
      expect(res.scale).toBe("INDIA_NAQI");
    },
  );

  it("handles PM10 dominant pollutant", () => {
    // PM2.5 = 20 (AQI ~33), PM10 = 200 (AQI ~167) -> PM10 dominates
    const res = scale.compute(20, 200);
    expect(res.value).toBe(167);
    expect(res.dominantPollutant).toBe("pm10");
    expect(res.category.band).toBe("MODERATE");
  });

  it("clamps negative pollutant inputs to zero", () => {
    const res = scale.compute(-10);
    expect(res.value).toBe(0);
    expect(res.category.band).toBe("GOOD");
  });
});

describe("UsEpaScale", () => {
  const scale = new UsEpaScale();

  const testCases = [
    { pm25: 6.0, expectedAqi: 25, band: "GOOD" },
    { pm25: 12.0, expectedAqi: 50, band: "GOOD" },
    { pm25: 20.0, expectedAqi: 68, band: "MODERATE" },
    { pm25: 35.4, expectedAqi: 100, band: "MODERATE" },
    { pm25: 45.0, expectedAqi: 124, band: "POOR" },
    { pm25: 80.0, expectedAqi: 164, band: "VERY_POOR" },
    { pm25: 200.0, expectedAqi: 250, band: "HAZARDOUS" },
    { pm25: 350.0, expectedAqi: 380, band: "HAZARDOUS" },
    { pm25: 550.0, expectedAqi: 500, band: "HAZARDOUS" },
  ];

  it.each(testCases)(
    "computes EPA PM2.5=$pm25 to AQI=$expectedAqi ($band)",
    ({ pm25, expectedAqi, band }) => {
      const res = scale.compute(pm25);
      expect(res.value).toBe(expectedAqi);
      expect(res.category.band).toBe(band);
      expect(res.scale).toBe("US_EPA");
    },
  );
});

describe("selectAqiScale", () => {
  it("selects IndiaNaqiScale for countryCode 'IN' or 'in'", () => {
    expect(selectAqiScale("IN").type).toBe("INDIA_NAQI");
    expect(selectAqiScale("in").type).toBe("INDIA_NAQI");
  });

  it("selects IndiaNaqiScale for coordinates within India bounding box", () => {
    // Delhi: Lat 28.61, Lon 77.20
    expect(selectAqiScale(undefined, 28.61, 77.2).type).toBe("INDIA_NAQI");
  });

  it("selects UsEpaScale for non-Indian locations", () => {
    // London: Lat 51.5, Lon -0.12
    expect(selectAqiScale("GB", 51.5, -0.12).type).toBe("US_EPA");
    expect(selectAqiScale("US").type).toBe("US_EPA");
  });
});
