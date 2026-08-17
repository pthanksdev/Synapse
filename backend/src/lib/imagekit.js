import ImageKit, { toFile } from "@imagekit/nodejs";

const imagekit = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

function hasImageKitConfig() {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `synapse-${Date.now()}-${safeName}`;
}

/**
 * Upload image or video buffer to ImageKit CDN
 */
async function uploadChatMedia(file) {
  if (!hasImageKitConfig()) {
    throw new Error("IMAGEKIT_PRIVATE_KEY environment variable is missing.");
  }
  const fileName = createFileName(file.originalname);

  const result = await imagekit.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "/chat",
  });

  return result.url;
}

/**
 * Upload base64, URL, or buffer to ImageKit CDN and return stored CDN URL
 */
async function uploadToImageKit(input, fileName = "wallpaper", folder = "/wallpapers") {
  if (!hasImageKitConfig()) {
    // Fallback to raw URL if ImageKit private key is not configured locally
    if (typeof input === "string" && (input.startsWith("http") || input.startsWith("/"))) {
      return input;
    }
  }

  const cleanFileName = createFileName(fileName);
  let filePayload = input;

  if (input && typeof input === "object" && input.buffer) {
    filePayload = await toFile(input.buffer, cleanFileName, { type: input.mimetype });
  }

  const result = await imagekit.files.upload({
    file: filePayload,
    fileName: cleanFileName,
    folder,
  });

  return result.url;
}

export { uploadChatMedia, uploadToImageKit, hasImageKitConfig };
