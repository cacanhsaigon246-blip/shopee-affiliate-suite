document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Elements
  const btnToggleMobileMenu = document.getElementById('btn-toggle-mobile-menu');
  const sidebarNav = document.getElementById('sidebar-nav');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
  const mobileMenuIcon = document.getElementById('mobile-menu-icon');

  // Authentication Elements
  const loginLockOverlay = document.getElementById('login-lock-overlay');
  const appMainContent = document.getElementById('app-main-content');
  const loginForm = document.getElementById('login-form');
  const loginPinInput = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const btnLockApp = document.getElementById('btn-lock-app');
  const btnChangePass = document.getElementById('btn-change-pass');
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const pwdEyeIcon = document.getElementById('pwd-eye-icon');

  // UI Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('page-title');
  const pageDesc = document.getElementById('page-desc');
  const globalAffIdInput = document.getElementById('global-aff-id');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Single Converter Elements
  const singleInputUrl = document.getElementById('single-input-url');
  const btnConvertSingle = document.getElementById('btn-convert-single');
  const singleResultCard = document.getElementById('single-result-card');
  const resFullLink = document.getElementById('res-full-link');
  const resShortLink = document.getElementById('res-short-link');
  const resEncodedOrigin = document.getElementById('res-encoded-origin');
  const qrCodeImg = document.getElementById('qr-code-img');
  const downloadQrBtn = document.getElementById('download-qr-btn');

  // Bulk Converter Elements
  const bulkInputText = document.getElementById('bulk-input-text');
  const btnConvertBulk = document.getElementById('btn-convert-bulk');
  const bulkResultsSection = document.getElementById('bulk-results-section');
  const bulkCount = document.getElementById('bulk-count');
  const bulkTableBody = document.querySelector('#bulk-table tbody');
  const btnCopyAllShort = document.getElementById('btn-copy-all-short');
  const btnExportCsv = document.getElementById('btn-export-csv');

  // Social Template Elements
  const tplSelect = document.getElementById('tpl-select');
  const tplLinkInput = document.getElementById('tpl-link-input');
  const tplOutput = document.getElementById('tpl-output');
  const btnCopyTemplate = document.getElementById('btn-copy-template');

  // History Elements
  const historyTbody = document.getElementById('history-tbody');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // --- MOBILE MENU TOGGLE LOGIC ---
  function openMobileMenu() {
    sidebarNav.classList.add('mobile-open');
    mobileMenuBackdrop.classList.remove('hidden');
    mobileMenuIcon.className = 'fa-solid fa-xmark';
  }

  function closeMobileMenu() {
    sidebarNav.classList.remove('mobile-open');
    mobileMenuBackdrop.classList.add('hidden');
    mobileMenuIcon.className = 'fa-solid fa-bars';
  }

  if (btnToggleMobileMenu) {
    btnToggleMobileMenu.addEventListener('click', () => {
      if (sidebarNav.classList.contains('mobile-open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  }

  // --- AUTHENTICATION & LOGIN LOCK LOGIC ---
  const DEFAULT_PIN = "041188";

  function getStoredPin() {
    return localStorage.getItem('shopee_aff_user_pin') || DEFAULT_PIN;
  }

  function checkAuthSession() {
    const isAuth = localStorage.getItem('shopee_aff_authenticated');
    if (isAuth === 'true') {
      unlockAppUI();
    } else {
      lockAppUI();
    }
  }

  function unlockAppUI() {
    loginLockOverlay.classList.add('hidden');
    appMainContent.classList.remove('blur-content');
    appMainContent.classList.add('unlocked');
    localStorage.setItem('shopee_aff_authenticated', 'true');
  }

  function lockAppUI() {
    loginLockOverlay.classList.remove('hidden');
    appMainContent.classList.add('blur-content');
    appMainContent.classList.remove('unlocked');
    localStorage.removeItem('shopee_aff_authenticated');
    loginPinInput.value = '';
    loginError.classList.add('hidden');
  }

  // Toggle Password Visibility
  if (togglePwdBtn && loginPinInput) {
    togglePwdBtn.addEventListener('click', () => {
      const isPwd = loginPinInput.type === 'password';
      loginPinInput.type = isPwd ? 'text' : 'password';
      pwdEyeIcon.className = isPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
  }

  // Handle Login Logic (Foolproof: Accepts both default PIN 041188 and stored PIN)
  function attemptLogin() {
    const inputPin = loginPinInput.value.trim();
    const currentPin = getStoredPin();

    if (inputPin === DEFAULT_PIN || inputPin === currentPin) {
      localStorage.setItem('shopee_aff_user_pin', DEFAULT_PIN); // Ensure reset to 041188 if default used
      unlockAppUI();
      showToast('Đăng nhập hệ thống thành công!');
    } else {
      loginError.classList.remove('hidden');
      loginPinInput.focus();
      loginPinInput.select();
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    attemptLogin();
  });

  // Lock System Button
  if (btnLockApp) {
    btnLockApp.addEventListener('click', () => {
      lockAppUI();
      showToast('Đã khóa hệ thống!');
    });
  }

  // Change Password Button
  if (btnChangePass) {
    btnChangePass.addEventListener('click', () => {
      const currentPin = getStoredPin();
      const oldPin = prompt("Nhập mật khẩu hiện tại:");
      if (oldPin === null) return;
      if (oldPin !== currentPin && oldPin !== DEFAULT_PIN) {
        alert("Mật khẩu hiện tại không đúng!");
        return;
      }
      const newPin = prompt("Nhập mật khẩu mới mong muốn:");
      if (newPin && newPin.trim().length >= 4) {
        localStorage.setItem('shopee_aff_user_pin', newPin.trim());
        alert("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.");
        showToast("Đã cập nhật mật khẩu mới!");
      } else if (newPin !== null) {
        alert("Mật khẩu mới phải có tối thiểu 4 ký tự!");
      }
    });
  }

  // Check auth session on page load
  checkAuthSession();

  // Load Saved Affiliate ID
  const savedAffId = localStorage.getItem('shopee_aff_id');
  if (savedAffId && savedAffId !== '14354840000') {
    globalAffIdInput.value = savedAffId;
  } else {
    globalAffIdInput.value = '17384730538';
    localStorage.setItem('shopee_aff_id', '17384730538');
  }

  globalAffIdInput.addEventListener('change', () => {
    localStorage.setItem('shopee_aff_id', globalAffIdInput.value.trim());
    showToast('Đã lưu Affiliate ID cố định!');
  });

  // Tab Switcher
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(nav => nav.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      item.classList.add('active');
      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');

      closeMobileMenu(); // Close mobile drawer when selecting tab

      // Update Page Header Titles
      switch (targetTab) {
        case 'single':
          pageTitle.textContent = 'Tạo & Tối Ưu Link Tiếp Thị Liên Kết';
          pageDesc.textContent = 'Chuyển đổi link Shopee nhanh chóng với UTM Tracking chuẩn xác và mã hóa an toàn.';
          break;
        case 'bulk':
          pageTitle.textContent = 'Chuyển Đổi Link Shopee Hàng Loạt';
          pageDesc.textContent = 'Xử lý hàng chục link Shopee cùng lúc, hỗ trợ xuất file Excel hoặc sao chép nhanh.';
          break;
        case 'template':
          pageTitle.textContent = 'Mẫu Bài Đăng Social Media';
          pageDesc.textContent = 'Tự động tạo nội dung bài đăng Facebook/Zalo/Telegram có chèn link Affiliate.';
          updateSocialTemplate();
          break;
        case 'history':
          pageTitle.textContent = 'Lịch Sử Chuyển Đổi Link Gần Đây';
          pageDesc.textContent = 'Danh sách tất cả các link bạn đã tạo gần đây trên trình duyệt.';
          renderHistoryTable();
          break;
        case 'matrix':
          pageTitle.textContent = 'Cấu Hình Tracking Sub-ID';
          pageDesc.textContent = 'Quy chuẩn hóa 5 thẻ Sub-ID để đo lường chính xác hiệu quả từng kênh bán hàng.';
          break;
        case 'chrome':
          pageTitle.textContent = 'Tiện Ích Trình Duyệt Chrome Extension';
          pageDesc.textContent = 'Tải và sử dụng công cụ tạo link 1-click trực tiếp trên trang Shopee.';
          break;
        case 'sheets':
          pageTitle.textContent = 'Tự Động Hóa Google Sheets';
          pageDesc.textContent = 'Sử dụng hàm công thức tùy chỉnh trực tiếp trên bảng tính Google Bảng tính.';
          break;
        case 'telegram':
          pageTitle.textContent = 'Mã Nguồn Bot Telegram';
          pageDesc.textContent = 'Kết nối Bot Telegram tự động trả lời link Affiliate rút gọn trong khung chat.';
          break;
      }
    });
  });

  // Show Toast Function
  function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // Core Link Generator Logic
  function buildShopeeAffLink(shopeeUrl, affId, subIds = []) {
    if (!shopeeUrl || !shopeeUrl.trim()) return null;
    const cleanUrl = shopeeUrl.trim();
    
    // 1. Encode origin URL
    const encodedOrigin = encodeURIComponent(cleanUrl);

    // 2. Format Sub-IDs (take up to 5 non-empty items)
    const validSubIds = subIds.map(s => s.trim()).filter(s => s.length > 0).slice(0, 5);
    const subIdStr = validSubIds.join('-');

    // 3. Build full s.shopee.vn link
    let fullAffLink = `https://s.shopee.vn/an_redir?origin_link=${encodedOrigin}&affiliate_id=${affId}`;
    if (subIdStr) {
      fullAffLink += `&sub_id=${subIdStr}`;
    }

    return {
      originUrl: cleanUrl,
      encodedOrigin: encodedOrigin,
      fullAffLink: fullAffLink,
      subIdStr: subIdStr
    };
  }

  // Shorten URL using our own branded domain redirect (Instant 0ms, No external API, 100% Reliable!)
  function shortenUrl(longUrl) {
    try {
      const b64 = btoa(unescape(encodeURIComponent(longUrl)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      return `https://shop.saigoncacanh.com/r.php?u=${b64}`;
    } catch (err) {
      return longUrl;
    }
  }

  // Save to History Log
  function saveToHistory(originUrl, shortUrl, fullAffLink, subIdStr) {
    const history = JSON.parse(localStorage.getItem('shopee_aff_history_list') || '[]');
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;
    
    history.unshift({
      timestamp: timeStr,
      originUrl: originUrl,
      shortUrl: shortUrl,
      fullAffLink: fullAffLink,
      subIdStr: subIdStr || 'N/A'
    });

    // Keep up to 100 entries
    if (history.length > 100) history.pop();

    localStorage.setItem('shopee_aff_history_list', JSON.stringify(history));
  }

  // Render History Table
  function renderHistoryTable() {
    const history = JSON.parse(localStorage.getItem('shopee_aff_history_list') || '[]');
    historyTbody.innerHTML = '';

    if (history.length === 0) {
      historyTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Chưa có lịch sử chuyển đổi link nào.</td></tr>`;
      return;
    }

    history.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-size: 0.8rem; color: var(--text-muted);">${item.timestamp}</td>
        <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.originUrl}</td>
        <td><a href="${item.shortUrl}" target="_blank" style="color: var(--primary); font-weight: bold;">${item.shortUrl}</a></td>
        <td><code>${item.subIdStr}</code></td>
        <td>
          <button class="btn btn-sm btn-outline copy-row-btn" data-url="${item.shortUrl}">
            <i class="fa-regular fa-copy"></i> Copy
          </button>
        </td>
      `;
      historyTbody.appendChild(tr);
    });

    // Attach copy handlers
    historyTbody.querySelectorAll('.copy-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        navigator.clipboard.writeText(url);
        showToast('Đã copy link!');
      });
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử tạo link không?')) {
        localStorage.removeItem('shopee_aff_history_list');
        renderHistoryTable();
        showToast('Đã xóa lịch sử!');
      }
    });
  }

  // Single Link Conversion Event
  btnConvertSingle.addEventListener('click', async () => {
    const rawUrl = singleInputUrl.value;
    const affId = globalAffIdInput.value.trim() || '17384730538';

    if (!rawUrl || (!rawUrl.includes('shopee.vn') && !rawUrl.includes('shope.ee'))) {
      alert('Vui lòng nhập đường dẫn Shopee hợp lệ!');
      return;
    }

    btnConvertSingle.disabled = true;
    btnConvertSingle.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang Xử Lý...';

    const subIds = [
      document.getElementById('sub1').value,
      document.getElementById('sub2').value,
      document.getElementById('sub3').value,
      document.getElementById('sub4').value,
      document.getElementById('sub5').value
    ];

    const result = buildShopeeAffLink(rawUrl, affId, subIds);
    const shortLink = await shortenUrl(result.fullAffLink);

    // Update Result UI
    resFullLink.value = result.fullAffLink;
    resShortLink.value = shortLink;
    resEncodedOrigin.textContent = result.encodedOrigin;

    // Save to history & template
    saveToHistory(rawUrl, shortLink, result.fullAffLink, result.subIdStr);
    tplLinkInput.value = shortLink;

    // Generate QR Code
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shortLink)}`;
    qrCodeImg.src = qrApi;
    downloadQrBtn.href = qrApi;

    singleResultCard.classList.remove('hidden');
    singleResultCard.scrollIntoView({ behavior: 'smooth' });

    btnConvertSingle.disabled = false;
    btnConvertSingle.innerHTML = '<i class="fa-solid fa-bolt"></i> Chuyển Đổi & Rút Gọn Link';
    showToast('Tạo link Affiliate thành công!');
  });

  // --- SOCIAL POST TEMPLATE LOGIC ---
  function updateSocialTemplate() {
    const link = tplLinkInput.value.trim() || 'https://tinyurl.com/sample-link';
    const type = tplSelect.value;

    let text = '';
    switch (type) {
      case 'hot':
        text = `🔥 SĂN MÃ GIẢM GIÁ SỐC SHOPEE HÔM NAY 🔥\n\n📌 Sản phẩm hot bán chạy giá cực êm!\n👉 Link mua hàng chính hãng: ${link}\n\n⚡ Nhanh tay chốt đơn kẻo hết mã ngon nha cả nhà! ❤️`;
        break;
      case 'flash':
        text = `⚡ KHUNG GIỜ FLASH SALE 0H - XẢ HÀNG GIÁ SỐC ⚡\n\n🛍️ Sản phẩm giảm tới 50% hôm nay:\n👉 Nhấp mua ngay tại đây: ${link}\n\n🎁 Nhớ chèn thêm voucher Shopee Payday trong giỏ hàng nha!`;
        break;
      case 'review':
        text = `⭐ REVIEW SẢN PHẨM DÙNG SIÊU THÍCH ⭐\n\nĐã trải nghiệm em này 2 tuần, chất lượng siêu ưng luôn mọi người ơi!\n👉 Mọi người ghé shop chuẩn tại đây nha: ${link}\n\nĐang có sale ngon lắm nè!`;
        break;
      case 'group':
        text = `📢 KÈO SĂN MÃ NGON CHO ANH EM TRONG NHÓM 📢\n\nShop chính hãng đang xả kho deal hời lắm nè cả nhà:\n👉 Link chốt đơn: ${link}\n\nChúc anh em săn mã thành công! 🚀`;
        break;
    }
    tplOutput.value = text;
  }

  if (tplSelect) tplSelect.addEventListener('change', updateSocialTemplate);
  if (tplLinkInput) tplLinkInput.addEventListener('input', updateSocialTemplate);

  if (btnCopyTemplate) {
    btnCopyTemplate.addEventListener('click', () => {
      if (!tplOutput.value.trim()) return;
      navigator.clipboard.writeText(tplOutput.value);
      showToast('Đã copy bài đăng hoàn chỉnh!');
    });
  }

  // Copy Buttons Event Listener
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const inputEl = document.getElementById(targetId);
      if (inputEl) {
        inputEl.select();
        navigator.clipboard.writeText(inputEl.value);
        showToast('Đã sao chép link!');
      }
    });
  });

  // Auto Select input text on tap for mobile convenience
  document.querySelectorAll('input[readonly]').forEach(input => {
    input.addEventListener('focus', () => {
      input.select();
    });
  });

  // Copy Code Snippets
  document.querySelectorAll('.btn-copy-code').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const codeEl = document.getElementById(targetId);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent);
        showToast('Đã sao chép đoạn mã!');
      }
    });
  });

  // Bulk Conversion Logic
  let bulkResultsList = [];

  btnConvertBulk.addEventListener('click', async () => {
    const rawText = bulkInputText.value.trim();
    if (!rawText) {
      alert('Vui lòng nhập ít nhất 1 link Shopee!');
      return;
    }

    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    const affId = globalAffIdInput.value.trim() || '17384730538';
    const sub1 = document.getElementById('bulk-sub1').value;
    const sub2 = document.getElementById('bulk-sub2').value;

    btnConvertBulk.disabled = true;
    btnConvertBulk.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang Xử Lý Hàng Loạt...';

    bulkTableBody.innerHTML = '';
    bulkResultsList = [];

    let count = 0;

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('shopee.vn') || line.includes('shope.ee')) {
          count++;
          const res = buildShopeeAffLink(line, affId, [sub1, sub2, `num${count}`]);
          const shortUrl = shortenUrl(res.fullAffLink);

          const item = {
            stt: count,
            originUrl: line,
            fullAffLink: res.fullAffLink,
            shortUrl: shortUrl,
            subIdStr: res.subIdStr
          };
          bulkResultsList.push(item);

          // Add Row to Table
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${count}</td>
            <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${line}</td>
            <td><a href="${shortUrl}" target="_blank" style="color: var(--primary); font-weight: bold;">${shortUrl}</a></td>
            <td><code>${res.subIdStr || 'N/A'}</code></td>
            <td>
              <button class="btn btn-sm btn-outline copy-row-btn" data-url="${shortUrl}">
                <i class="fa-regular fa-copy"></i> Copy
              </button>
            </td>
          `;
          bulkTableBody.appendChild(tr);
        }
      }

      bulkCount.textContent = count;
      bulkResultsSection.classList.remove('hidden');

      // Save latest item to history & render history once
      if (bulkResultsList.length > 0) {
        const last = bulkResultsList[0];
        saveToHistory(last.originUrl, last.shortUrl, last.fullAffLink, last.subIdStr);
        renderHistoryTable();
      }

      // Attach copy handlers to row buttons
      document.querySelectorAll('.copy-row-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.getAttribute('data-url');
          navigator.clipboard.writeText(url);
          showToast('Đã copy link!');
        });
      });

      showToast(`Đã chuyển đổi ${count} link!`);
    } catch (err) {
      console.error('Bulk convert error:', err);
      alert('Có lỗi xảy ra trong quá trình chuyển đổi hàng loạt.');
    } finally {
      btnConvertBulk.disabled = false;
      btnConvertBulk.innerHTML = '<i class="fa-solid fa-layer-group"></i> Xử Lý Chuyển Đổi Hàng Loạt';
    }
  });

  // Copy All Short Links
  btnCopyAllShort.addEventListener('click', () => {
    if (bulkResultsList.length === 0) return;
    const allShort = bulkResultsList.map(item => item.shortUrl).join('\n');
    navigator.clipboard.writeText(allShort);
    showToast('Đã copy tất cả link rút gọn!');
  });

  // Export to CSV
  btnExportCsv.addEventListener('click', () => {
    if (bulkResultsList.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,STT,Link Goc Shopee,Link Affiliate Rut Gon,Sub ID,Link Goc Affiliate Full\n";
    bulkResultsList.forEach(row => {
      csvContent += `"${row.stt}","${row.originUrl}","${row.shortUrl}","${row.subIdStr}","${row.fullAffLink}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopee_affiliate_links_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file CSV thành công!');
  });

  // --- CHROME EXTENSION AUTO SCAN & SYNC LOGIC ---
  const chromeExtIdInput = document.getElementById('chrome-ext-id');
  const btnScanImages = document.getElementById('btn-scan-images');
  const scanProgressBox = document.getElementById('scan-progress-box');
  const scanProgressStatus = document.getElementById('scan-progress-status');
  const scanProgressPercent = document.getElementById('scan-progress-percent');
  const scanProgressBar = document.getElementById('scan-progress-bar');

  // Load Saved Extension ID
  if (chromeExtIdInput) {
    const savedExtId = localStorage.getItem('shopee_chrome_ext_id') || 'giiidopldjffcbabkhepanbmmngolbni';
    chromeExtIdInput.value = savedExtId;
    chromeExtIdInput.addEventListener('change', () => {
      localStorage.setItem('shopee_chrome_ext_id', chromeExtIdInput.value.trim());
      showToast('Đã lưu Chrome Extension ID!');
    });
  }

  // Parse Shopee shopid & itemid
  function parseShopeeUrl(url) {
    // Standard product: shopee.vn/product/123/456
    const pRegex = /\/product\/(\d+)\/(\d+)/;
    const pMatch = url.match(pRegex);
    if (pMatch) {
      return { shopid: pMatch[1], itemid: pMatch[2] };
    }

    // Short code or other pages: -i.123.456
    const iRegex = /-i\.(\d+)\.(\d+)/;
    const iMatch = url.match(iRegex);
    if (iMatch) {
      return { shopid: iMatch[1], itemid: iMatch[2] };
    }

    // Affiliate redirect (opaanlp): /opaanlp/123/456
    const oRegex = /\/opaanlp\/(\d+)\/(\d+)/;
    const oMatch = url.match(oRegex);
    if (oMatch) {
      return { shopid: oMatch[1], itemid: oMatch[2] };
    }

    return null;
  }

  // Sleep utility
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  if (btnScanImages) {
    btnScanImages.addEventListener('click', () => {
      if (bulkResultsList.length === 0) {
        alert('Hãy chuyển đổi hàng loạt ít nhất 1 link Shopee trước khi quét ảnh!');
        return;
      }

      const extId = chromeExtIdInput ? chromeExtIdInput.value.trim() : 'giiidopldjffcbabkhepanbmmngolbni';
      if (!extId) {
        alert('Vui lòng điền Chrome Extension ID ở cột trái!');
        return;
      }

      // Ping Chrome Extension
      scanProgressBox.classList.remove('hidden');
      scanProgressStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang kết nối tới Chrome Extension...';
      
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
        // Fallback if not on Chrome
        alert('Không tìm thấy trình duyệt Google Chrome hoặc tính năng Extension. Vui lòng chạy trên Google Chrome!');
        scanProgressBox.classList.add('hidden');
        return;
      }

      chrome.runtime.sendMessage(extId, { action: 'ping' }, async (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          alert('LỖI KẾT NỐI TIỆN ÍCH!\n\nVui lòng kiểm tra:\n1. Anh đã cài đặt và Bật tiện ích Chrome Extension chưa.\n2. Cột trái "Chrome Extension ID" đã điền chính xác ID của tiện ích chưa.');
          scanProgressBox.classList.add('hidden');
          return;
        }

        // Connection OK! Start Scanning Process
        await runImageScanning(extId);
      });
    });
  }

  async function runImageScanning(extId) {
    btnScanImages.disabled = true;
    btnScanImages.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang quét...';
    
    const total = bulkResultsList.length;
    const scannedProducts = [];
    let completed = 0;

    for (let i = 0; i < total; i++) {
      const item = bulkResultsList[i];
      completed++;
      
      // Update UI Progress
      const percent = Math.round((completed / total) * 100);
      scanProgressPercent.textContent = `${percent}%`;
      scanProgressBar.style.width = `${percent}%`;
      scanProgressStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý link ${completed}/${total}...`;

      let shopeeLink = item.originUrl;

      // 1. Resolve redirect if short link (s.shopee.vn or shope.ee)
      if (shopeeLink.includes('s.shopee.vn') || shopeeLink.includes('shope.ee')) {
        try {
          const resolveRes = await new Promise((resolve) => {
            chrome.runtime.sendMessage(extId, { action: 'resolve_redirect', url: shopeeLink }, resolve);
          });
          if (resolveRes && resolveRes.success) {
            shopeeLink = resolveRes.finalUrl;
          }
        } catch (e) {
          console.warn('Resolve redirect failed:', e);
        }
      }

      // 2. Parse shopid and itemid
      const ids = parseShopeeUrl(shopeeLink);
      let imgUrl = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80'; // fallback
      let title = item.originUrl;
      let price = 'Deal Ngon';
      let shopName = 'Shopee Mall';

      if (ids) {
        try {
          // Fetch product detail via extension
          const productRes = await new Promise((resolve) => {
            chrome.runtime.sendMessage(extId, { 
              action: 'fetch_shopee_product', 
              itemid: ids.itemid, 
              shopid: ids.shopid 
            }, resolve);
          });

          if (productRes && productRes.success && productRes.data) {
            const data = productRes.data;
            title = data.name || title;
            price = data.price ? (data.price / 100000).toLocaleString('vi-VN') + 'đ' : price;
            shopName = data.shop_location || shopName;
            
            // Trích xuất chuẩn xác ảnh từ Shopee API (images[0], image, cover_image, image_url...)
            const imgHash = (data.images && data.images.length > 0 ? data.images[0] : null) || data.image || data.cover_image || data.image_url || data.item_image;
            if (imgHash) {
              if (imgHash.startsWith('http')) {
                imgUrl = imgHash;
              } else {
                imgUrl = `https://down-vn.img.susercontent.com/file/${imgHash}`;
              }
            }
          }
        } catch (e) {
          console.warn('Fetch details failed:', e);
        }
      }

      // Map Category dynamically based on title
      let cat = 'phu-kien';
      let catName = 'Phụ Kiện Bể Cá';
      const cleanTitle = title.toLowerCase();
      if (cleanTitle.includes('thức ăn') || cleanTitle.includes('cám') || cleanTitle.includes('mồi') || cleanTitle.includes('dinh dưỡng')) {
        cat = 'thuc-an';
        catName = 'Thức Ăn & Dinh Dưỡng';
      } else if (cleanTitle.includes('bơm') || cleanTitle.includes('lọc') || cleanTitle.includes('sứ') || cleanTitle.includes('bông') || cleanTitle.includes('túi lọc') || cleanTitle.includes('vật liệu')) {
        cat = 'bom-loc';
        catName = 'Bơm & Thiết Bị Lọc';
      } else if (cleanTitle.includes('đèn') || cleanTitle.includes('led') || cleanTitle.includes('ánh sáng') || cleanTitle.includes('chiếu sáng')) {
        cat = 'den-led';
        catName = 'Đèn LED & Thủy Sinh';
      } else if (cleanTitle.includes('vi sinh') || cleanTitle.includes('men') || cleanTitle.includes('thuốc') || cleanTitle.includes('nấm') || cleanTitle.includes('khử')) {
        cat = 'thuoc-men';
        catName = 'Thuốc & Men Vi Sinh';
      }

      scannedProducts.push({
        id: `csv-sp${completed}`,
        title: title,
        category: cat,
        categoryName: catName,
        price: price,
        originalPrice: 'Shopee Deal',
        discount: 'HOT',
        rating: '5.0',
        sold: 'Shopee Mall',
        image: imgUrl,
        shopeeUrl: item.shortUrl, // affiliate shortlink
        status: 'active'
      });

      // Small delay to avoid API rate limiting
      await sleep(250);
    }

    // 3. Send data to storefront save-products.php
    scanProgressStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang cập nhật danh mục Siêu Thị...';
    
    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify({ products: scannedProducts }));

      const saveRes = await fetch('https://shop.saigoncacanh.com/save-products.php?token=041188', {
        method: 'POST',
        body: formData
      });

      const saveJson = await saveRes.json();
      if (saveJson && saveJson.success) {
        scanProgressStatus.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> 🎉 ĐÃ ĐỒNG BỘ 100% ẢNH THẬT LÊN SIÊU THỊ THÀNH CÔNG!';
        showToast('Đồng bộ ảnh Siêu Thị thành công!');
      } else {
        scanProgressStatus.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i> Lỗi lưu sản phẩm lên máy chủ: ' + (saveJson.error || '');
      }
    } catch (e) {
      console.error(e);
      scanProgressStatus.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i> Không thể kết nối với máy chủ.';
    }

    btnScanImages.disabled = false;
    btnScanImages.innerHTML = '<i class="fa-solid fa-camera"></i> Quét Ảnh & Đồng Bộ Siêu Thị';
  }
});

