"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import taro from "@/data/taro.json";
import styles from "./WeatherAPI.module.scss";

type Weather = {
  city: string;
  country: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  conditionGroup: string;
  precipitation: number;
};

type WeatherResponse = {
  weather?: Weather[];
  message?: string;
};

const WINDOW_IMAGES = [
  "/window02.svg",
  "/window01.svg",
  "/window01.svg",
  "/window02.svg",
];

const WINDOW_DECORATIONS = [
  "/martryocika.png",
  "/fortune.png",
  "/eyes.png",
  "/daruma.png",
  "/clover.png",
] as const;

const VISIBLE_CITY_COUNT = 3;
const CITY_DRAG_THRESHOLD = 22;

function weatherImage(condition: string) {
  switch (condition.toLowerCase()) {
    case "clear":
      return "/clear.webp";
    case "thunderstorm":
      return "/Thunderstorm.webp";
    case "drizzle":
    case "rain":
      return "/Rain.webp";
    case "snow":
      return "/Snow.webp";
    default:
      return "/Clouds.webp";
  }
}

function randomTaro() {
  return taro[Math.floor(Math.random() * taro.length)];
}

export function WeatherAPI() {
  const [weather, setWeather] = useState<Weather[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cityOffset, setCityOffset] = useState(0);
  const [cityDragY, setCityDragY] = useState(0);
  const cityDragStartY = useRef<number | null>(null);
  const cityWasDragged = useRef(false);
  const lastWheelTime = useRef(0);
  const [fortune, setFortune] = useState(taro[0]);
  const [windowDecorationIndex, setWindowDecorationIndex] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [flippedCards, setFlippedCards] = useState<[boolean, boolean]>([
    false,
    false,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch("/api/weather", { signal: controller.signal });
        const data = (await response.json()) as WeatherResponse;

        if (!response.ok || !data.weather) {
          throw new Error(data.message ?? "Could not load weather data.");
        }

        setWeather(data.weather);
        // 첫 화면은 Ansan입니다. 이후 날씨 변경은 도시 버튼 클릭으로만 일어납니다.
        setSelectedIndex(0);
        setFortune(randomTaro());
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load weather data.",
        );
      }
    }

    loadWeather();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const chooseDecoration = window.setTimeout(() => {
      const storageKey = "weather-window-decoration";
      const savedValue = window.sessionStorage.getItem(storageKey);
      const savedIndex = savedValue === null ? Number.NaN : Number(savedValue);
      const hasSavedIndex =
        Number.isInteger(savedIndex) &&
        savedIndex >= 0 &&
        savedIndex < WINDOW_DECORATIONS.length;
      const decorationIndex = hasSavedIndex
        ? savedIndex
        : Math.floor(Math.random() * WINDOW_DECORATIONS.length);

      window.sessionStorage.setItem(storageKey, String(decorationIndex));
      setWindowDecorationIndex(decorationIndex);
    }, 0);

    return () => window.clearTimeout(chooseDecoration);
  }, []);

  const selectedWeather = weather[selectedIndex];
  const selectedWeatherImage = selectedWeather
    ? weatherImage(selectedWeather.conditionGroup)
    : "/Clouds.webp";
  const visibleCities = Array.from(
    { length: Math.min(VISIBLE_CITY_COUNT + 2, weather.length) },
    (_, index) => {
      const weatherIndex =
        (cityOffset + index - 2 + weather.length) % weather.length;
      return { weatherIndex, city: weather[weatherIndex].city };
    },
  );

  const selectCity = (weatherIndex: number) => {
    if (cityWasDragged.current) return;

    setSelectedIndex(weatherIndex);
    setCityOffset(weatherIndex);
    setFortune(randomTaro());
  };

  const moveCityList = (direction: -1 | 1) => {
    if (!weather.length) return;

    setCityOffset(
      (current) => (current + direction + weather.length) % weather.length,
    );
  };

  const startCityDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    cityDragStartY.current = event.clientY;
    cityWasDragged.current = false;
  };

  const dragCityList = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (cityDragStartY.current === null) return;

    const distance = event.clientY - cityDragStartY.current;
    if (Math.abs(distance) >= CITY_DRAG_THRESHOLD) {
      cityWasDragged.current = true;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    setCityDragY(Math.max(-48, Math.min(48, distance)));
  };

  const finishCityDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (cityDragStartY.current === null) return;

    const distance = event.clientY - cityDragStartY.current;
    const wasDragged = Math.abs(distance) >= CITY_DRAG_THRESHOLD;
    cityWasDragged.current = wasDragged;
    if (wasDragged) {
      moveCityList(distance < 0 ? 1 : -1);
    }

    cityDragStartY.current = null;
    setCityDragY(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    window.setTimeout(() => {
      cityWasDragged.current = false;
    }, 0);
  };

  const scrollCityList = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 4) return;
    event.preventDefault();

    const now = Date.now();
    if (now - lastWheelTime.current < 220) return;
    lastWheelTime.current = now;
    moveCityList(event.deltaY > 0 ? 1 : -1);
  };
  const toggleCard = (cardIndex: 0 | 1) => {
    setFlippedCards((current) =>
      current.map((isFlipped, index) =>
        index === cardIndex ? !isFlipped : isFlipped,
      ) as [boolean, boolean],
    );
  };

  return (
    <section className={styles.section} aria-labelledby="weather-api-title">
      <div className={styles.composition}>
        <button
          className={`${styles.card} ${styles.cardLeft} ${
            flippedCards[0] ? styles.cardFlipped : ""
          }`}
          type="button"
          aria-label="Flip the left tarot card"
          aria-pressed={flippedCards[0]}
          onClick={() => toggleCard(0)}
        >
          <span className={styles.cardInner}>
            <Image
              className={`${styles.cardFace} ${styles.cardFront}`}
              src="/card.svg"
              alt=""
              fill
              sizes="14vw"
            />
            <Image
              className={`${styles.cardFace} ${styles.cardBack}`}
              src="/card-back.svg"
              alt=""
              fill
              sizes="14vw"
            />
          </span>
        </button>
        <button
          className={`${styles.card} ${styles.cardRight} ${
            flippedCards[1] ? styles.cardFlipped : ""
          }`}
          type="button"
          aria-label="Flip the right tarot card"
          aria-pressed={flippedCards[1]}
          onClick={() => toggleCard(1)}
        >
          <span className={styles.cardInner}>
            <Image
              className={`${styles.cardFace} ${styles.cardFront}`}
              src="/card.svg"
              alt=""
              fill
              sizes="14vw"
            />
            <Image
              className={`${styles.cardFace} ${styles.cardBack}`}
              src="/card-back.svg"
              alt=""
              fill
              sizes="14vw"
            />
          </span>
        </button>

        <div className={styles.ribbon}>
        <Image
          src="/riborn.svg"
          alt="Daily Weather & Taro"
          fill
          sizes="48vw"
        />
        <h2 id="weather-api-title" className={styles.visuallyHidden}>
          Daily Weather &amp; Taro
        </h2>
        </div>

        <div className={styles.windows} aria-hidden="true">
        {WINDOW_IMAGES.map((src, index) => (
          <div className={styles.window} key={`${src}-${index}`}>
            {index === 1 && (
              <Image
                key={selectedWeatherImage}
                className={styles.windowWeather}
                src={selectedWeatherImage}
                alt=""
                fill
                sizes="14vw"
              />
            )}
            {index === 2 && windowDecorationIndex !== null && (
              <Image
                key={WINDOW_DECORATIONS[windowDecorationIndex]}
                className={styles.windowDecoration}
                src={WINDOW_DECORATIONS[windowDecorationIndex]}
                alt=""
                fill
                sizes="14vw"
              />
            )}
            <Image
              className={styles.windowFrame}
              src={src}
              alt=""
              fill
              sizes="14vw"
            />
          </div>
        ))}
        </div>

        <div className={styles.result} aria-live="polite">
        <Image className={styles.resultShape} src="/setumei.svg" alt="" fill sizes="78vw" />

        <div className={styles.resultContent}>
          {error ? (
            <p className={styles.status}>{error}</p>
          ) : selectedWeather ? (
            <>
              <div
                className={styles.cityViewport}
                aria-label="Select a city"
                onPointerDown={startCityDrag}
                onPointerMove={dragCityList}
                onPointerUp={finishCityDrag}
                onPointerCancel={finishCityDrag}
                onWheel={scrollCityList}
              >
                <div
                  className={`${styles.cityTrack} ${
                    cityDragY !== 0 ? styles.cityTrackDragging : ""
                  }`}
                  style={{ "--city-drag-y": `${cityDragY}px` } as CSSProperties}
                >
                  {visibleCities.map(({ city, weatherIndex }) => (
                    <button
                      className={`${styles.cityButton} ${
                        weatherIndex === selectedIndex ? styles.cityButtonActive : ""
                      }`}
                      type="button"
                      key={`${cityOffset}-${city}`}
                      aria-pressed={weatherIndex === selectedIndex}
                      onClick={() => selectCity(weatherIndex)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.weatherHeading}>
                <p>{selectedWeather.country}</p>
                <h3>{selectedWeather.city}</h3>
              </div>

              <dl className={styles.weatherDetails}>
                <div>
                  <dt>Temperature</dt>
                  <dd>{selectedWeather.temperature.toFixed(1)}°C</dd>
                </div>
                <div>
                  <dt>Wind</dt>
                  <dd>{selectedWeather.windSpeed.toFixed(1)} m/s</dd>
                </div>
                <div>
                  <dt>Humidity</dt>
                  <dd>{selectedWeather.humidity}%</dd>
                </div>
                <div>
                  <dt>Weather</dt>
                  <dd>{selectedWeather.condition}</dd>
                </div>
                <div>
                  <dt>Rain / Snow</dt>
                  <dd>{selectedWeather.precipitation.toFixed(1)} mm</dd>
                </div>
              </dl>

              <p className={styles.fortune}>
                <strong>Today&apos;s Taro</strong>
                <span>{fortune}</span>
              </p>
            </>
          ) : (
            <p className={styles.status}>Loading today&apos;s weather and fortune...</p>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
