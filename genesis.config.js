// my-game-project/genesis.config.js

export default {
  // Lệnh để kiểm tra code.
  executionCommand: "npx tsc --noEmit",

  // Các file cung cấp bối cảnh cho Architect Agent.
  contextFilePaths: [
    "core/**/*.ts",
    "components/**/*.tsx",
    "App.tsx",
  ],

  // === CÁC TÙY CHỌN AN TOÀN MỚI ===

  // (Bắt buộc) Yêu cầu xác nhận trước mỗi nhiệm vụ.
  // Đặt là `true` để kiểm soát, `false` để chạy tự động hoàn toàn.
  requireConfirmation: true,

  // (Tùy chọn) Thời gian chờ giữa các lần gọi API (tính bằng mili giây).
  // 1500ms tương đương 40 yêu cầu/phút, an toàn dưới mức 60 của Gemini.
  apiDelayMs: 1500,

  // (Tùy chọn) Ước tính chi phí cho mỗi 1 triệu token.
  // Kiểm tra trang giá của Google để có con số chính xác nhất.
  costPerMillionTokens: 2.0, 
  
  // === CÁC TÙY CHỌN KHÁC ===
  model: "gemini-2.5-flash",
  maxDebugAttempts: 3,
};