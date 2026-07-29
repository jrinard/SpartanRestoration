import { readdir } from "fs/promises";
import path from "path";
import {
  imageLibraryFolderPublicPrefix,
  imageLibraryPublicPrefix,
  imageLibraryThemeSegment,
  isImageFileName,
  type ImageLibraryScope,
  toImageLibraryEntry,
  type ImageLibraryEntry,
} from "@/lib/image-library";

function resolveLibraryRoot(scope: ImageLibraryScope) {
  const themeDir = path.join(process.cwd(), "public", imageLibraryThemeSegment);

  if (scope === "theme") {
    return { absoluteDir: themeDir, publicPrefix: imageLibraryPublicPrefix };
  }

  return {
    absoluteDir: path.join(themeDir, "library"),
    publicPrefix: imageLibraryFolderPublicPrefix,
  };
}

async function collectLibraryImages(
  absoluteDir: string,
  publicPrefix: string,
  relativeDir = "",
): Promise<string[]> {
  const scanDir = relativeDir ? path.join(absoluteDir, relativeDir) : absoluteDir;
  let entries;

  try {
    entries = await readdir(scanDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const images: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const entryRelative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      images.push(...(await collectLibraryImages(absoluteDir, publicPrefix, entryRelative)));
      continue;
    }

    if (entry.isFile() && isImageFileName(entry.name)) {
      images.push(`${publicPrefix}/${entryRelative.split(path.sep).join("/")}`);
    }
  }

  return images;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope: ImageLibraryScope =
    searchParams.get("scope") === "theme" ? "theme" : "library";
  const { absoluteDir, publicPrefix } = resolveLibraryRoot(scope);
  const paths = await collectLibraryImages(absoluteDir, publicPrefix);
  const images: ImageLibraryEntry[] = paths.sort().map(toImageLibraryEntry);

  return Response.json({ images, scope, themeFolder: imageLibraryThemeSegment });
}
