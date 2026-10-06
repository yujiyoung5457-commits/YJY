import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import sharp from "sharp";

const publicDirectory = path.resolve("public");
const convertibleExtensions = new Set([".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"]);
const concurrency = 3;

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedImages = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) return collectImages(entryPath);
      if (!entry.isFile()) return [];

      return convertibleExtensions.has(path.extname(entry.name).toLowerCase()) ? [entryPath] : [];
    }),
  );

  return nestedImages.flat();
}

function formatMegabytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function removeWithRetry(filePath) {
  let lastError;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(filePath, { force: true });
      return;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "EBUSY") throw error;
      lastError = error;
      await delay(150 * (attempt + 1));
    }
  }

  throw lastError;
}

async function convertImage(inputPath) {
  const extension = path.extname(inputPath).toLowerCase();
  const outputPath = path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, path.extname(inputPath))}.webp`,
  );
  const inputStats = await stat(inputPath);

  if (inputStats.size === 0) {
    return { status: "skipped", inputPath, reason: "empty file" };
  }

  const quality = extension === ".png" ? 90 : 82;

  try {
    await removeWithRetry(outputPath);
    await sharp(inputPath, { failOn: "warning", animated: true })
      .rotate()
      .webp({
        quality,
        alphaQuality: 100,
        effort: 4,
        smartSubsample: true,
      })
      .toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();

    if (metadata.format !== "webp" || !metadata.width || !metadata.height) {
      throw new Error("generated file is not a valid WebP image");
    }

    const outputStats = await stat(outputPath);
    await removeWithRetry(inputPath);

    return {
      status: "converted",
      inputPath,
      outputPath,
      inputBytes: inputStats.size,
      outputBytes: outputStats.size,
    };
  } catch (error) {
    return {
      status: "failed",
      inputPath,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const images = await collectImages(publicDirectory);

  if (images.length === 0) {
    console.log("No PNG/JPG/BMP/TIFF images found in public.");
    return;
  }

  const results = new Array(images.length);
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (nextIndex < images.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await convertImage(images[index]);
      completed += 1;

      if (completed % 25 === 0 || completed === images.length) {
        console.log(`Processed ${completed}/${images.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const converted = results.filter((result) => result.status === "converted");
  const skipped = results.filter((result) => result.status === "skipped");
  const failed = results.filter((result) => result.status === "failed");
  const originalBytes = converted.reduce((total, result) => total + result.inputBytes, 0);
  const webpBytes = converted.reduce((total, result) => total + result.outputBytes, 0);

  console.log(`Converted: ${converted.length}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Before: ${formatMegabytes(originalBytes)}`);
  console.log(`After: ${formatMegabytes(webpBytes)}`);
  console.log(
    `Saved: ${formatMegabytes(originalBytes - webpBytes)} (${(
      (1 - webpBytes / originalBytes) *
      100
    ).toFixed(1)}%)`,
  );

  for (const result of [...skipped, ...failed]) {
    console.log(`${result.status.toUpperCase()}: ${result.inputPath} (${result.reason})`);
  }

  if (failed.length > 0) process.exitCode = 1;
}

await main();
