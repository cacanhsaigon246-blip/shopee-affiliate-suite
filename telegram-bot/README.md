# Shopee Affiliate Telegram Bot

## Hướng dẫn cài đặt & Chạy Bot Telegram

1. **Tạo Bot Telegram mới:**
   - Mở Telegram và tìm kiếm `@BotFather`.
   - Gửi lệnh `/newbot` và làm theo hướng dẫn để lấy `TELEGRAM_BOT_TOKEN`.

2. **Cài đặt thư viện Python:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Cấu hình Token & Affiliate ID:**
   - Mở file `bot.py`.
   - Dán token của bạn vào `TELEGRAM_BOT_TOKEN = "MÃ_TOKEN_CỦA_BẠN"`.
   - Cập nhật `AFFILIATE_ID = "MÃ_ID_CỦA_BẠN"`.

4. **Chạy Bot:**
   ```bash
   python bot.py
   ```
