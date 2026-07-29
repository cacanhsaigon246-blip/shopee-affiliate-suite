/**
 * Shopee Affiliate Google Apps Script Generator
 * Hướng dẫn sử dụng:
 * 1. Mở file Google Sheets của bạn.
 * 2. Chọn Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Dán toàn bộ nội dung file này vào và nhấn Save (Lưu).
 * 4. Quay lại Google Sheets, sử dụng công thức:
 *    =SHOPEE_AFF(A2, "facebook", "post")
 */

// Cấu hình Affiliate ID cố định
var GLOBAL_AFFILIATE_ID = "14354840000";

/**
 * Hàm tùy chỉnh tạo Link Affiliate Shopee chuẩn
 * @param {string} shopeeUrl - Đường dẫn Shopee gốc
 * @param {string} sub1 - [Tùy chọn] Nguồn traffic (facebook, tiktok, zalo...)
 * @param {string} sub2 - [Tùy chọn] Định dạng (post, reel, bio...)
 * @param {string} sub3 - [Tùy chọn] Chiến dịch (sale99, payday...)
 * @return {string} Link Tiếp thị liên kết Shopee
 * @customfunction
 */
function SHOPEE_AFF(shopeeUrl, sub1, sub2, sub3) {
  if (!shopeeUrl || shopeeUrl.toString().trim() === "") {
    return "";
  }
  
  var cleanUrl = shopeeUrl.toString().trim();
  var encodedUrl = encodeURIComponent(cleanUrl);
  
  var subIds = [];
  if (sub1 && sub1.toString().trim() !== "") subIds.push(sub1.toString().trim());
  if (sub2 && sub2.toString().trim() !== "") subIds.push(sub2.toString().trim());
  if (sub3 && sub3.toString().trim() !== "") subIds.push(sub3.toString().trim());
  
  var subStr = subIds.join("-");
  
  var fullLink = "https://s.shopee.vn/an_redir?origin_link=" + encodedUrl + "&affiliate_id=" + GLOBAL_AFFILIATE_ID;
  if (subStr) {
    fullLink += "&sub_id=" + subStr;
  }
  
  return fullLink;
}

/**
 * Tự động tạo menu riêng trong Google Sheets khi mở file
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ Shopee Affiliate')
    .addItem('Chuyển đổi Cột A sang Cột B', 'batchConvertColumn')
    .addToUi();
}

/**
 * Hàm hỗ trợ tự động quét tất cả link ở Cột A và xuất link Affiliate sang Cột B
 */
function batchConvertColumn() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('Không tìm thấy dữ liệu link từ hàng 2!');
    return;
  }
  
  var range = sheet.getRange(2, 1, lastRow - 1, 1);
  var values = range.getValues();
  var results = [];
  
  for (var i = 0; i < values.length; i++) {
    var rawUrl = values[i][0];
    if (rawUrl) {
      results.push([SHOPEE_AFF(rawUrl, "sheets", "auto")]);
    } else {
      results.push([""]);
    }
  }
  
  sheet.getRange(2, 2, results.length, 1).setValues(results);
  SpreadsheetApp.getUi().alert('Đã chuyển đổi xong ' + results.length + ' link sang Cột B!');
}
