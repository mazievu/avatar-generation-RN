// services/ColorBaker.expo.ts (Final Patch - Alpha Masking Fix)
import { Skia, BlendMode, ImageFormat } from "@shopify/react-native-skia";
import { File, Directory, Paths } from "expo-file-system";
import { Asset } from "expo-asset";
import * as Crypto from "expo-crypto";

const CACHE_DIR = new Directory(Paths.cache, "avatar_variants");

function cacheKey(baseModuleId: number, colorHex: string, version = "v1") {
  // Tăng phiên bản cache để bake lại toàn bộ với logic đúng
  return `${baseModuleId}|${colorHex}|${version}-v4-alphamask`;
}

async function cachePathFor(key: string): Promise<File> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
  return new File(CACHE_DIR, `${hash}.png`);
}

export async function getOrBakeVariantFromModule(
  baseModuleId: number,
  colorHex: string,
  version = "v1"
): Promise<string> {
  if (!CACHE_DIR.exists) {
    CACHE_DIR.create();
  }

  const outFile = await cachePathFor(cacheKey(baseModuleId, colorHex, version));
  
  if (outFile.exists) {
    return outFile.uri;
  }

  const asset = Asset.fromModule(baseModuleId);
  if (!asset.downloaded) await asset.downloadAsync();
  
  const srcFile = new File(asset.localUri!); 
  const bytes = await srcFile.bytes();

  const img = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(bytes));
  if (!img) throw new Error("Skia: cannot decode base image");

  const w = img.width(), h = img.height();
  const surface = Skia.Surface.MakeOffscreen(w, h);
  const canvas = surface.getCanvas();
  
  canvas.clear(Skia.Color("transparent"));

  // --- LOGIC RENDER 2 BƯỚC ĐÚNG CHUẨN ---

  // BƯỚC 1: Tô màu cho ảnh gốc.
  // Kết quả của bước này là ảnh có màu đúng, chi tiết đúng, nhưng nền bị đặc.
  const colorPaint = Skia.Paint();
  colorPaint.setColorFilter(
    Skia.ColorFilter.MakeBlend(Skia.Color(colorHex), BlendMode.Color)
  );
  canvas.drawImage(img, 0, 0, colorPaint);

  // BƯỚC 2: Áp dụng mặt nạ alpha từ ảnh gốc.
  // Vẽ lại ảnh gốc lên trên với BlendMode.DstIn.
  // Thao tác này sẽ chỉ giữ lại kết quả của Bước 1 ở những nơi ảnh gốc có pixel.
  const maskPaint = Skia.Paint();
  maskPaint.setBlendMode(BlendMode.DstIn);
  canvas.drawImage(img, 0, 0, maskPaint);

  // --- KẾT THÚC LOGIC RENDER ---
  
  const imageSnapshot = surface.makeImageSnapshot();
  // @ts-ignore
  const pngBytes: Uint8Array | null = imageSnapshot.encodeToBytes?.(ImageFormat.PNG) ?? null;
  
  if (pngBytes) {
    outFile.write(pngBytes);
  } else {
    const pngB64 = imageSnapshot.encodeToBase64(ImageFormat.PNG, 100);
    outFile.write(pngB64);
  }

  return outFile.uri;
}

export async function clearAllBaked() {
  try {
    if (CACHE_DIR.exists) {
      CACHE_DIR.delete();
    }
  } catch (e) {
    console.error("Failed to clear avatar cache:", e);
  }
}