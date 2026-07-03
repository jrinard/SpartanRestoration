import { readdir } from "fs/promises";
import path from "path";
import {
  imageLibraryPublicPrefix,
  imageLibraryThemeSegment,
  isImageFileName,
  toImageLibraryEntry,
  type ImageLibraryEntry,
} from "@/lib/image-library";

const LIBRARY_DIR = path.join(process.cwd(), "public", imageLibraryThemeSegment, "library");

async function collectLibraryImages(relativeDir = ""): Promise<string[]> {
  const absoluteDir = relativeDir ? path.join(LIBRARY_DIR, relativeDir) : LIBRARY_DIR;
  let entries;

  try {
    entries = await readdir(absoluteDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const images: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const entryRelative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      images.push(...(await collectLibraryImages(entryRelative)));
      continue;
    }

    if (entry.isFile() && isImageFileName(entry.name)) {
      images.push(
        `${imageLibraryPublicPrefix}/${entryRelative.split(path.sep).join("/")}`,
      );
    }
  }

  return images;
}

export async function GET() {
  const paths = await collectLibraryImages();
  const images: ImageLibraryEntry[] = paths.sort().map(toImageLibraryEntry);

  return Response.json({ images });
}
