const CITY_NAMES = ["Ansan", "Helsinki", "Tokyo", "Rome", "Moscow"] as const;
const COUNTRY_CODES = ["KR", "FI", "JP", "IT", "RU"] as const;

type OpenWeatherResponse = {
  name?: string;
  weather?: Array<{ main?: string; description?: string }>;
  main?: { temp?: number; humidity?: number };
  wind?: { speed?: number };
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
  sys?: { country?: string };
  message?: string;
};

function countryName(countryCode?: string) {
  if (!countryCode) return "-";

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

async function getWeather(
  city: (typeof CITY_NAMES)[number],
  countryCode: (typeof COUNTRY_CODES)[number],
  apiKey: string,
) {
  const search = new URLSearchParams({
    q: `${city},${countryCode}`,
    appid: apiKey,
    units: "metric",
    lang: "en",
  });
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?${search.toString()}`,
    { next: { revalidate: 600 } },
  );
  const data = (await response.json()) as OpenWeatherResponse;

  if (!response.ok || !data.main) {
    throw new Error(data.message ?? `Could not load weather for ${city}.`);
  }

  return {
    city,
    country: countryName(data.sys?.country),
    temperature: data.main.temp ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    humidity: data.main.humidity ?? 0,
    condition: data.weather?.[0]?.description ?? data.weather?.[0]?.main ?? "Unavailable",
    conditionGroup: data.weather?.[0]?.main ?? "Clouds",
    precipitation:
      data.rain?.["1h"] ??
      data.snow?.["1h"] ??
      data.rain?.["3h"] ??
      data.snow?.["3h"] ??
      0,
  };
}

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return Response.json(
      { message: "OPENWEATHER_API_KEY is not configured." },
      { status: 503 },
    );
  }

  try {
    const weather = await Promise.all(
      CITY_NAMES.map((city, index) => getWeather(city, COUNTRY_CODES[index], apiKey)),
    );

    return Response.json({ weather });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Could not load weather data.",
      },
      { status: 502 },
    );
  }
}
