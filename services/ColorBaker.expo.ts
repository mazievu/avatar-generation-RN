// services/ColorBaker.expo.ts (SDK 51 style)
import { Skia, BlendMode, ImageFormat } from "@shopify/react-native-skia";
import { File, Directory, Paths } from "expo-file-system";
import { Asset } from "expo-asset";
import * as Crypto from "expo-crypto";

const CACHE_DIR = new Directory(Paths.cache, "avatar_variants");

function cacheKey(baseModuleId: number, colorHex: string, version = "v1") {
  return `${baseModuleId}|${colorHex}|${version}`;
}

async function cachePathFor(key: string) {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
  // Tạo File trỏ tới cache file .png
  return new File(CACHE_DIR, `${hash}.png`);
}

export async function getOrBakeVariantFromModule(
  baseModuleId: number,
  colorHex: string,
  version = "v1"
): Promise<string> {
  // Tạo thư mục cache nếu cần
  try { if (!CACHE_DIR.exists) CACHE_DIR.create(); } catch {}

  const outFile = await cachePathFor(cacheKey(baseModuleId, colorHex, version));
  if (outFile.exists) return outFile.uri;

  // 1) resolve asset → localUri
  const asset = Asset.fromModule(baseModuleId);
  if (!asset.downloaded) await asset.downloadAsync();
  const localUri = asset.localUri!;

  // 2) đọc bytes ảnh gốc (API mới: File implements Blob)
  //    Lưu ý: constructor File chấp nhận object từ picker/asset; với uri ta làm như sau:
  const src = new File(localUri as any); // SDK 51 cho phép tạo File từ uri/object
  const bytes = await src.bytes();       // Uint8Array

  const img = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(bytes));
  if (!img) throw new Error("Skia: cannot decode base image");

  // 3) render offscreen + tô màu
  const w = img.width(), h = img.height();
  const surface = Skia.Surface.MakeOffscreen(w, h);
  const canvas = surface.getCanvas();
  // @ts-ignore
  canvas.clear(Skia.Color("transparent"));
  canvas.drawImage(img, 0, 0);
  const paint = Skia.Paint();
  paint.setBlendMode(BlendMode.Color);
  // @ts-ignore
  paint.setColor(Skia.Color(colorHex));
  canvas.drawRect(Skia.XYWHRect(0, 0, w, h), paint);

  // 4) encode PNG → ghi bằng API mới
  // Ưu tiên bytes; fallback base64 nếu project bạn đang dùng Skia cũ.
  // @ts-ignore
  const pngBytes: Uint8Array | null = surface.makeImageSnapshot().encodeToBytes?.(ImageFormat.PNG) ?? null;
  if (pngBytes) {
    outFile.write(pngBytes);          // ghi nhị phân
  } else {
    const pngB64 = surface.makeImageSnapshot().encodeToBase64(ImageFormat.PNG);
    outFile.write(pngB64 as any);     // ghi chuỗi; (lúc này coi như text base64)
  }
  return outFile.uri;
}

export async function clearAllBaked() {
  try { CACHE_DIR.delete(); } catch {}
}