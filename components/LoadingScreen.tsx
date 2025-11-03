import React, { useEffect, useState } from "react";
import { View, Text, Platform, ImageSourcePropType, ImageBackground, StyleSheet } from "react-native";
import { preheatVariants, BakeTask } from "../services/AvatarPreheater";
import { hexFromColorName } from "../utils/colors";
import { Manifest, Character } from "../core/types";

const bgImage = require('../assets/loading_scence.png');

// KHỚP QUY ƯỚC TÊN BIẾN THỂ
function createVariantSrc(baseSrc: string, variant: string) {
  const parts = baseSrc.split(".");
  const ext = parts.pop();
  const base = parts.join(".");
  return `${base}__${variant}.${ext}`;
}

export default function LoadingScreen({
  manifest,
  characters,                  // danh sách nhân vật sắp xuất hiện
  images,                       // Record<string, number>  (src -> require)
  onReady,
}: {
  manifest: Manifest;
  characters: Character[];
  images: Record<string, ImageSourcePropType>;
  onReady: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1) Tạo danh sách task bake theo nhân vật & màu sẽ dùng
    const tasks: BakeTask[] = [];
    const uniqueTasks = new Set<string>();
    // Đồng thời giữ danh sách key để tiêm vào map "images" sau khi bake
    const variantKeys: Array<{ key: string; bakedFor: { baseSrc: string; colorName: string } }> = [];

    for (const ch of characters) {
      const st = ch.avatarState || {};
      for (const layer of manifest) {
        const optId = (st as any)[layer.key];
        if (!optId) continue;
        const option = layer.options.find(o => o.id === optId);
        if (!option?.src) continue;

        // Lấy colorName theo layer
        const colorName =
          layer.key === "frontHair" ? st.frontHairColor :
          layer.key === "backHair"  ? st.backHairColor  :
          layer.key === "eyebrows"  ? st.eyebrowsColor  :
          layer.key === "beard"     ? st.beardColor     :
          layer.key === "eyes"      ? st.eyesColor      :
          layer.key === "mouth"     ? st.mouthColor     :
          undefined;

        if (!colorName) continue;
        const hex = hexFromColorName(colorName);
        if (!hex) continue;

        const baseModuleId = images[option.src];
        if (typeof baseModuleId !== "number") continue;

        const taskKey = `${baseModuleId}-${hex}`;
        if (!uniqueTasks.has(taskKey)) {
            tasks.push({ baseModuleId, colorHex: hex });
            uniqueTasks.add(taskKey);
        }

        // Chuẩn bị key map mà AgeAwareAvatarPreview mong đợi (base__color)
        const variantKey = createVariantSrc(option.src, colorName);
        variantKeys.push({ key: variantKey, bakedFor: { baseSrc: option.src, colorName } });
      }
    }

    let cancelled = false;
    (async () => {
      if (!tasks.length) {
        onReady();
        return;
      }
      await preheatVariants(tasks, (done, total) => !cancelled && setProgress(done / total), 4); // Increased concurrency

      // 2) Sau khi bake xong, ghép "images[base__color] = { uri: file://... }"
      //    để getVariantSrc(...) hiện tại tự tìm thấy
      for (const vk of variantKeys) {
        const { baseSrc, colorName } = vk.bakedFor;

        // Tìm lại moduleId từ baseSrc để suy ra đường dẫn cache:
        const baseModuleId = images[baseSrc];
        if (typeof baseModuleId !== "number") continue;

        // Lấy lại đường dẫn baked (không encode lại lần 2)
        // => gọi getOrBakeVariantFromModule sẽ hit cache ngay
        const { getOrBakeVariantFromModule } = await import("../services/ColorBaker.expo");
        const hex = hexFromColorName(colorName)!;
        const outPath = await getOrBakeVariantFromModule(baseModuleId, hex);

        // Tiêm vào map images (ImageSourcePropType)
        (images as any)[vk.key] = { uri: outPath };
      }

      if (!cancelled) onReady();
    })();

    return () => { cancelled = true; };
  }, [manifest, characters, images, onReady]);

  return (
    <ImageBackground source={bgImage} style={styles.container} resizeMode="cover">
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Preparing avatar colors… {Math.round(progress * 100)}%</Text>
        <View style={styles.progressBar}>
          <View style={{ width: `${progress * 100}%`, height: 12, backgroundColor: "#3b82f6", borderRadius: 6 }} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  progressContainer: {
    width: '80%',
    marginBottom: 50,
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
});