# ⚡ Shopee Affiliate All-In-One Suite & Storefront Automation (2026 Enterprise)

Hệ thống Tiếp thị Liên kết Shopee tự động hóa toàn diện dành riêng cho thương hiệu **Sài Gòn Cá Cảnh** (Chủ sở hữu: **Anh Phát** / KOC Account `cannabis_sg`). 

---

## 🏛️ ĐỊA CHỈ HỆ THỐNG TRỰC TUYẾN (LIVE ONLINE)

- 🛍️ **Siêu Thị Cá Cảnh (Storefront Catalog):** [https://shop.saigoncacanh.com](https://shop.saigoncacanh.com)
- 🎛️ **Web Dashboard Quản Trị:** [http://aff.saigoncacanh.com](http://aff.saigoncacanh.com)
- 🔑 **Mã Affiliate ID Chính Thức:** `17384730538`
- 🔒 **Mật Khẩu / PIN Token Bảo Mật:** `041188`
- 🐙 **GitHub Repository:** [https://github.com/cacanhsaigon246-blip/shopee-affiliate-suite](https://github.com/cacanhsaigon246-blip/shopee-affiliate-suite)
- 📘 **Sổ Tay Hệ Thống & Ký Ức Đào Tạo:** [SO_TAY_HE_THONG_SHOPEE_AFFILIATE.md](file:///c:/Users/SAIGONCACANH/.gemini/antigravity/scratch/shopee-affiliate-suite/SO_TAY_HE_THONG_SHOPEE_AFFILIATE.md)

---

## 📐 QUY TRÌNH HOẠT ĐỘNG KỸ THUẬT (SYSTEM WORKFLOW)

```
[Link Shopee Gốc / Thẻ Sản Phẩm Shopee]
                     ↓
[1. Chrome Extension v2.3.3 Scrape] ──> Auto-Scroll Lazy Load & Bắt Ảnh Thật CDN
                     ↓
[2. Quy Đổi Link Mua Hàng Công Khai] ──> https://shopee.vn/product/SHOPID/ITEMID
                     ↓
[3. Ghép Domain Trung Gian an_redir] ──> https://s.shopee.vn/an_redir?origin_link=
                     ↓
[4. Đính Kèm Affiliate ID Gốc] ──> &affiliate_id=17384730538
                     ↓
[5. Lưu Trữ 3 Lớp Bảo Vệ Máy Chủ] ──> products-data.json / products-data.js / products-data.bak.json
                     ↓
[6. Hiển Thị Siêu Thị shop.saigoncacanh.com] ──> Khách bấm MUA NAY nhảy thẳng vào Shopee!
```

---

## 🛠️ BỘ 5 CÔNG CỤ THÀNH PHẦN

| STT | Công Cụ | Mô Tả & Sử Dụng | Vị Trí Code |
|---|---|---|---|
| 1 | **Siêu Thị Cá Cảnh Storefront** | Giao diện bán hàng Dark Mode cao cấp, hiển thị ảnh thật, phân loại kệ hàng tự động, liên kết mua ngay kèm Affiliate ID. | `storefront/` |
| 2 | **Chrome Extension v2.3.3** | Cào dữ liệu 1-Click siêu tốc 64+ sản phẩm/trang, tự động cuộn trang kích hoạt lazy load, xử lý lỗi im lặng. | `chrome-extension/` |
| 3 | **Web Admin Dashboard** | Công cụ quản lý tạo link đơn & chuyển đổi hàng loạt, bảo mật khóa MK & giao diện di động. | `index.html`, `js/app.js`, `css/style.css` |
| 4 | **Rút Gọn Link Nội Bộ** | Rút gọn link chuẩn domain riêng `shop.saigoncacanh.com/r.php?u=...` tăng 300% click-through. | `storefront/r.php`, `shorten.php` |
| 5 | **Script Google Sheets & Telegram Bot** | Tự động hóa tạo link qua công thức Bảng tính & Bot nhắn tin Telegram. | `google-sheets/`, `telegram-bot/` |

---

## 📚 SỔ TAY HỆ THỐNG VÀ KÝ ỨC VẬN HÀNH

Tất cả hướng dẫn chi tiết, quy trình nạp hàng, xóa/reset kho hàng, lệnh deploy Hostinger và ký ức lịch sử phát triển cùng anh Phát được lưu giữ vĩnh viễn tại file sổ tay [SO_TAY_HE_THONG_SHOPEE_AFFILIATE.md](file:///c:/Users/SAIGONCACANH/.gemini/antigravity/scratch/shopee-affiliate-suite/SO_TAY_HE_THONG_SHOPEE_AFFILIATE.md).
