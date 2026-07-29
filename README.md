# ⚡ Shopee Affiliate All-In-One Optimization Suite & Mobile App

Hệ thống tối ưu hóa và tự động hóa Tiếp thị Liên kết Shopee toàn diện. Tích hợp 4 nền tảng: **Web Dashboard**, **Chrome Extension**, **Google Sheets Script** và **Telegram Bot**.

---

## 🏛️ ĐỊA CHỈ TRUY CẬP HỆ THỐNG (LIVE ONLINE)

- 🌐 **Web App Online:** [http://aff.saigoncacanh.com](http://aff.saigoncacanh.com)
- 🔒 **Mật khẩu truy cập mặc định:** `041188` (Hỗ trợ nhớ phiên tự động & đổi mật khẩu).
- 🐙 **GitHub Repo:** [https://github.com/cacanhsaigon246-blip/shopee-affiliate-suite](https://github.com/cacanhsaigon246-blip/shopee-affiliate-suite)

---

## 📐 QUY TRÌNH HOẠT ĐỘNG KỸ THUẬT (SYSTEM WORKFLOW)

Mọi link Affiliate được tạo qua hệ thống đều tuân thủ chính xác quy chuẩn của Shopee (theo Bài viết 172955):

```
[Link Shopee Gốc] 
      ↓
[1. URL Encode] ──> Mã hóa ký tự đặc biệt (https://shopee.vn/... -> https%3A%2F%2Fshopee.vn%2F...)
      ↓
[2. Ghép Domain Trung Gian] ──> https://s.shopee.vn/an_redir?origin_link=
      ↓
[3. Gán Affiliate ID] ──> &affiliate_id=14354840000
      ↓
[4. Ghép Sub-ID Tracking] ──> &sub_id=sub1-sub2-sub3-sub4-sub5
      ↓
[5. Rút Gọn Link & Tạo Mã QR] ──> Gọi API Shortener -> Trả về Link Rút Gọn & Ảnh QR Code
```

---

## 🛠️ BỘ 4 CÔNG CỤ TÍCH HỢP

| STT | Công Cụ | Mô Tả & Sử Dụng | Vị Trí Code |
|---|---|---|---|
| 1 | **Web Dashboard** | Giao diện quản lý tạo link đơn & chuyển đổi hàng loạt, xuất file Excel, bảo mật khóa MK & hỗ trợ di động. | `index.html`, `js/app.js`, `css/style.css` |
| 2 | **Chrome Extension** | Tiện ích mở rộng tạo link 1-click ngay khi lướt web Shopee. | `chrome-extension/` |
| 3 | **Google Sheets Script** | Tự động hóa tạo link trực tiếp bằng công thức trong Bảng tính. | `google-sheets/ShopeeAffiliate.gs` |
| 4 | **Telegram Bot** | Bot tự động phản hồi link Affiliate ngắn khi quăng link vào khung chat. | `telegram-bot/bot.py` |

---

## 📱 TÍNH NĂNG NỔI BẬT DÀNH CHO DI ĐỘNG (MOBILE RESPONSIVE)
- Menu trượt di động (Mobile Navigation Drawer).
- Chỉnh kích thước phím bấm & ô nhập dữ liệu chuẩn 16px chống auto-zoom trên iPhone/Android.
- Chức năng **1-Tap Auto Select**: Chạm vào link kết quả là tự động bôi đen để copy tức thì.
- Chế độ Đăng Nhập nhớ phiên làm việc tự động tương tự phần mềm POS.
