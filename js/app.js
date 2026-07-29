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

  // Handle Login Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputPin = loginPinInput.value.trim();
    const currentPin = getStoredPin();

    if (inputPin === currentPin) {
      unlockAppUI();
      showToast('Đăng nhập hệ thống thành công!');
    } else {
      loginError.classList.remove('hidden');
      loginPinInput.focus();
      loginPinInput.select();
    }
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
      if (oldPin !== currentPin) {
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
  if (savedAffId) {
    globalAffIdInput.value = savedAffId;
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

  // Shorten URL using TinyURL API with Fallback
  async function shortenUrl(longUrl) {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (response.ok) {
        const shortUrl = await response.text();
        return shortUrl.trim();
      }
    } catch (err) {
      console.warn('TinyURL API rate limit or error, returning full link:', err);
    }
    return longUrl; // Fallback to full link
  }

  // Single Link Conversion Event
  btnConvertSingle.addEventListener('click', async () => {
    const rawUrl = singleInputUrl.value;
    const affId = globalAffIdInput.value.trim() || '14354840000';

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
    const affId = globalAffIdInput.value.trim() || '14354840000';
    const sub1 = document.getElementById('bulk-sub1').value;
    const sub2 = document.getElementById('bulk-sub2').value;

    btnConvertBulk.disabled = true;
    btnConvertBulk.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang Xử Lý Hàng Loạt...';

    bulkTableBody.innerHTML = '';
    bulkResultsList = [];

    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('shopee.vn') || line.includes('shope.ee')) {
        count++;
        const res = buildShopeeAffLink(line, affId, [sub1, sub2, `num${count}`]);
        const shortUrl = await shortenUrl(res.fullAffLink);

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

    // Attach copy handlers to row buttons
    document.querySelectorAll('.copy-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        navigator.clipboard.writeText(url);
        showToast('Đã copy link!');
      });
    });

    btnConvertBulk.disabled = false;
    btnConvertBulk.innerHTML = '<i class="fa-solid fa-layer-group"></i> Xử Lý Chuyển Đổi Hàng Loạt';
    showToast(`Đã chuyển đổi ${count} link!`);
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
});
