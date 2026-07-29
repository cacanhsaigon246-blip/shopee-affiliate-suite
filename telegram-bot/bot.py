import logging
import urllib.parse
import aiohttp
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# Cấu hình
AFFILIATE_ID = "14354840000"
TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_HERE"

# Bật log
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_msg = (
        "👋 **Chào mừng bạn đến với Shopee Affiliate Converter Bot!**\n\n"
        "Hãy gửi cho tôi bất kỳ đường dẫn sản phẩm/shop Shopee nào, tôi sẽ tự động chuyển đổi thành "
        "Link Affiliate rút gọn kèm mã QR chuẩn hóa cho bạn."
    )
    await update.message.reply_text(welcome_msg, parse_mode='Markdown')

async def shorten_url(long_url: str) -> str:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://tinyurl.com/api-create.php?url={urllib.parse.quote(long_url)}") as resp:
                if resp.status == 200:
                    return await resp.text()
    except Exception as e:
        logging.warning(f"Error shortening URL: {e}")
    return long_url

async def convert_link(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    
    if "shopee.vn" in text or "shope.ee" in text:
        # 1. Encode origin URL
        encoded_origin = urllib.parse.quote(text, safe='')
        
        # 2. Tạo link Affiliate chuẩn
        full_aff_link = f"https://s.shopee.vn/an_redir?origin_link={encoded_origin}&affiliate_id={AFFILIATE_ID}&sub_id=telegram-bot"
        
        # 3. Rút gọn link
        short_link = await shorten_url(full_aff_link)
        
        # 4. QR Code API
        qr_api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={urllib.parse.quote(short_link)}"
        
        reply_text = (
            f"⚡ **LINK AFFILIATE SHOPEE CỦA BẠN**\n\n"
            f"🔗 **Link Rút Gọn:** {short_link}\n\n"
            f"📋 **Link Đầy Đủ:** `{full_aff_link}`\n\n"
            f"💡 *Hãy sao chép link rút gọn ở trên để đăng bài!*"
        )
        
        # Gửi kèm ảnh QR Code
        await update.message.reply_photo(photo=qr_api_url, caption=reply_text, parse_mode='Markdown')
    else:
        await update.message.reply_text("⚠️ Vui lòng gửi link Shopee hợp lệ (chứa shopee.vn hoặc shope.ee)")

def main():
    if TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print("⚠️ VUI LÒNG THAY TELEGRAM_BOT_TOKEN TRONG FILE bot.py BẰNG TOKEN CỦA BẠN!")
        return

    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), convert_link))
    
    print("🚀 Bot Telegram Shopee Affiliate đang chạy...")
    app.run_polling()

if __name__ == '__main__':
    main()
