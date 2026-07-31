document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Elements
  const btnToggleMobileMenu = document.getElementById('btn-toggle-mobile-menu');
  const sidebarNav = document.getElementById('sidebar-nav');
  const loginLockOverlay = document.getElementById('login-lock-overlay');
  const appMainContent = document.getElementById('app-main-content');
  const loginForm = document.getElementById('login-form');
  const loginPinInput = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const btnLockApp = document.getElementById('btn-lock-app');
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const pwdEyeIcon = document.getElementById('pwd-eye-icon');

  // UI Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-content');
  const globalAffIdInput = document.getElementById('global-aff-id');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Toast Function
  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // Helper to remove Vietnamese tones for unaccented search
  function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    try { str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch(e){}
    return str;
  }

  // Passcode Authentication
  const AUTH_KEY = 'shopee_aff_auth_pin';
  const DEFAULT_PIN = '041188';

  function checkAuthStatus() {
    const savedPin = localStorage.getItem(AUTH_KEY);
    if (savedPin === DEFAULT_PIN) {
      unlockApp();
    } else {
      lockApp();
    }
  }

  function unlockApp() {
    if (loginLockOverlay) loginLockOverlay.classList.add('hidden');
    if (appMainContent) appMainContent.classList.remove('blur-content');
  }

  function lockApp() {
    if (loginLockOverlay) loginLockOverlay.classList.remove('hidden');
    if (appMainContent) appMainContent.classList.add('blur-content');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = loginPinInput.value.trim();
      if (enteredPin === DEFAULT_PIN) {
        localStorage.setItem(AUTH_KEY, enteredPin);
        if (loginError) loginError.classList.add('hidden');
        unlockApp();
        showToast('Đăng nhập hệ thống thành công!');
      } else {
        if (loginError) loginError.classList.remove('hidden');
      }
    });
  }

  if (btnLockApp) {
    btnLockApp.addEventListener('click', () => {
      localStorage.removeItem(AUTH_KEY);
      lockApp();
      showToast('Đã khóa hệ thống!');
    });
  }

  if (togglePwdBtn && loginPinInput && pwdEyeIcon) {
    togglePwdBtn.addEventListener('click', () => {
      const type = loginPinInput.getAttribute('type') === 'password' ? 'text' : 'password';
      loginPinInput.setAttribute('type', type);
      pwdEyeIcon.className = type === 'password' ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    });
  }

  checkAuthStatus();

  // Tab Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      tabPanes.forEach(pane => {
        if (pane.id === `tab-${targetTab}`) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });

      if (targetTab === 'products') {
        loadAdminProducts();
      } else if (targetTab === 'analytics') {
        loadAnalytics();
      }

      if (window.innerWidth <= 768 && sidebarNav) {
        sidebarNav.classList.remove('active');
      }
    });
  });

  if (btnToggleMobileMenu && sidebarNav) {
    btnToggleMobileMenu.addEventListener('click', () => {
      sidebarNav.classList.toggle('active');
    });
  }

  // Copy Buttons
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const inputEl = document.getElementById(targetId);
      if (inputEl && inputEl.value) {
        navigator.clipboard.writeText(inputEl.value);
        showToast('Đã sao chép vào bộ nhớ tạm!');
      }
    });
  });

  // Single Link Converter
  const singleForm = document.getElementById('single-form');
  if (singleForm) {
    singleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('single-input-url').value.trim();
      const sub1 = document.getElementById('single-sub1').value.trim();
      const sub2 = document.getElementById('single-sub2').value.trim();
      const affId = globalAffIdInput.value.trim() || '17384730538';

      if (!rawUrl) return;

      const encoded = encodeURIComponent(rawUrl);
      const fullLink = `https://s.shopee.vn/an_redir?origin_link=${encoded}&affiliate_id=${affId}&sub_id=${sub1}-${sub2}`;
      
      document.getElementById('single-res-full').value = fullLink;

      const b64 = btoa(unescape(encodeURIComponent(fullLink)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const shortLink = `https://shop.saigoncacanh.com/r.php?u=${b64}`;
      document.getElementById('single-res-short').value = shortLink;

      const qrBox = document.getElementById('single-qr-code');
      qrBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortLink)}" alt="QR Code" style="width: 150px; height: 150px; border-radius: 8px;">`;

      document.getElementById('single-result-box').classList.remove('hidden');
      showToast('Đã tạo link Shopee Affiliate thành công!');
    });
  }

  // Bulk Converter
  const btnBulkConvert = document.getElementById('btn-bulk-convert');
  if (btnBulkConvert) {
    btnBulkConvert.addEventListener('click', () => {
      const rawText = document.getElementById('bulk-input-urls').value.trim();
      const sub1 = document.getElementById('bulk-sub1').value.trim() || 'bulk';
      const sub2 = document.getElementById('bulk-sub2').value.trim() || 'campaign';
      const affId = globalAffIdInput.value.trim() || '17384730538';

      if (!rawText) {
        alert('Vui lòng nhập ít nhất 1 link Shopee!');
        return;
      }

      const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const bulkTableBody = document.getElementById('bulk-table-body');
      bulkTableBody.innerHTML = '';

      lines.forEach((url, idx) => {
        const encoded = encodeURIComponent(url);
        const fullLink = `https://s.shopee.vn/an_redir?origin_link=${encoded}&affiliate_id=${affId}&sub_id=${sub1}-${sub2}-num${idx+1}`;
        const b64 = btoa(unescape(encodeURIComponent(fullLink)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const shortLink = `https://shop.saigoncacanh.com/r.php?u=${b64}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${url}</td>
          <td><input type="text" class="form-control form-control-sm bulk-short-link" value="${shortLink}" readonly></td>
          <td><button class="btn btn-sm btn-secondary btn-copy-item"><i class="fa-regular fa-copy"></i> Copy</button></td>
        `;
        bulkTableBody.appendChild(tr);
      });

      bulkTableBody.querySelectorAll('.btn-copy-item').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          const inp = bulkTableBody.querySelectorAll('.bulk-short-link')[i];
          navigator.clipboard.writeText(inp.value);
          showToast('Đã copy link!');
        });
      });

      document.getElementById('bulk-count').textContent = lines.length;
      document.getElementById('bulk-result-section').classList.remove('hidden');
      showToast(`Đã chuyển đổi thành công ${lines.length} link!`);
    });
  }

  // ==========================================
  // STOREFRONT PRODUCT MANAGER - CARDS GRID LAYOUT
  // ==========================================
  let adminProducts = [];
  let currentAdminCategory = 'all';
  let adminSearchQuery = '';

  const adminSearchInput = document.getElementById('admin-search-input');
  const btnClearAdminSearch = document.getElementById('btn-clear-admin-search');
  const adminCatPills = document.querySelectorAll('.admin-cat-pill');
  const adminCardsGrid = document.getElementById('admin-cards-grid');
  const totalAdminCount = document.getElementById('total-admin-count');
  const selectedCountEl = document.getElementById('selected-count');
  const btnSelectAllCards = document.getElementById('btn-select-all-cards');
  const btnReloadAdminProducts = document.getElementById('btn-reload-admin-products');
  const btnDeleteSelectedProducts = document.getElementById('btn-delete-selected-products');
  const btnPurgeStore = document.getElementById('btn-purge-store');

  async function loadAdminProducts() {
    if (!adminCardsGrid) return;
    adminCardsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
        <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p style="margin-top: 10px;">Đang nạp kho hàng từ shop.saigoncacanh.com...</p>
      </div>
    `;
    
    try {
      const res = await fetch(`https://shop.saigoncacanh.com/get-products.php?v=${Date.now()}`);
      if (res.ok) {
        adminProducts = await res.json();
      } else {
        adminProducts = [];
      }
    } catch(e) {
      adminProducts = [];
    }

    renderAdminProducts();
  }

  function renderAdminProducts() {
    if (!adminCardsGrid) return;
    const cleanQuery = removeVietnameseTones(adminSearchQuery);

    const filtered = adminProducts.filter(item => {
      const matchCat = currentAdminCategory === 'all' || item.category === currentAdminCategory;
      if (!matchCat) return false;
      if (!cleanQuery) return true;

      const titleClean = removeVietnameseTones(item.title);
      const catClean = removeVietnameseTones(item.categoryName);
      return titleClean.includes(cleanQuery) || catClean.includes(cleanQuery);
    });

    if (totalAdminCount) totalAdminCount.textContent = adminProducts.length;
    updateSelectedCount();

    if (filtered.length === 0) {
      adminCardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
          <i class="fa-solid fa-box-open fa-3x" style="margin-bottom: 12px; opacity: 0.5;"></i>
          <p>Kho hàng chưa có sản phẩm nào phù hợp.</p>
        </div>
      `;
      return;
    }

    adminCardsGrid.innerHTML = '';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'admin-prod-card';
      card.setAttribute('data-id', item.id);
      
      card.innerHTML = `
        <div class="admin-card-img-wrap">
          <input type="checkbox" class="chk-admin-item admin-card-chk" data-id="${item.id}">
          <span class="admin-card-cat-badge">${item.categoryName || 'Phụ Kiện'}</span>
          <img src="${item.image}" alt="${item.title}" loading="lazy">
        </div>
        <div class="admin-card-title" title="${item.title}">${item.title}</div>
        <div class="admin-card-price">${item.price || 'Deal Ngon'}</div>
        <div class="admin-card-actions">
          <button class="btn-admin-del btn-delete-single-admin" data-id="${item.id}" title="Xóa sản phẩm này">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
          <button class="btn-admin-post btn-gen-post-admin" data-id="${item.id}" title="Tạo bài đăng Social 1-Click">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Đăng Bài
          </button>
          <a href="${item.shopeeUrl}" target="_blank" class="btn-admin-view" title="Xem trên Shopee">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      `;
      adminCardsGrid.appendChild(card);
    });

    adminCardsGrid.querySelectorAll('.chk-admin-item').forEach(chk => {
      chk.addEventListener('change', () => {
        const cardParent = chk.closest('.admin-prod-card');
        if (cardParent) {
          if (chk.checked) cardParent.classList.add('selected');
          else cardParent.classList.remove('selected');
        }
        updateSelectedCount();
      });
    });

    adminCardsGrid.querySelectorAll('.btn-delete-single-admin').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        deleteSingleAdminProduct(pId);
      });
    });

    // 1-CLICK SOCIAL POST GENERATOR TRIGGER
    adminCardsGrid.querySelectorAll('.btn-gen-post-admin').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const item = adminProducts.find(p => p.id === pId);
        if (item) openSocialPostModal(item);
      });
    });
  }

  function updateSelectedCount() {
    if (!adminCardsGrid || !selectedCountEl) return;
    const selected = adminCardsGrid.querySelectorAll('.chk-admin-item:checked');
    selectedCountEl.textContent = selected.length;
  }

  let allSelectedState = false;
  if (btnSelectAllCards) {
    btnSelectAllCards.addEventListener('click', () => {
      allSelectedState = !allSelectedState;
      adminCardsGrid.querySelectorAll('.chk-admin-item').forEach(chk => {
        chk.checked = allSelectedState;
        const cardParent = chk.closest('.admin-prod-card');
        if (cardParent) {
          if (allSelectedState) cardParent.classList.add('selected');
          else cardParent.classList.remove('selected');
        }
      });
      btnSelectAllCards.innerHTML = allSelectedState 
        ? '<i class="fa-regular fa-square"></i> Bỏ Chọn Tất Cả' 
        : '<i class="fa-regular fa-square-check"></i> Chọn Tất Cả';
      updateSelectedCount();
    });
  }

  adminCatPills.forEach(pill => {
    pill.addEventListener('click', () => {
      adminCatPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentAdminCategory = pill.getAttribute('data-cat');
      renderAdminProducts();
    });
  });

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      adminSearchQuery = e.target.value;
      if (adminSearchQuery) {
        btnClearAdminSearch.classList.remove('hidden');
      } else {
        btnClearAdminSearch.classList.add('hidden');
      }
      renderAdminProducts();
    });
  }

  if (btnClearAdminSearch) {
    btnClearAdminSearch.addEventListener('click', () => {
      adminSearchInput.value = '';
      adminSearchQuery = '';
      btnClearAdminSearch.classList.add('hidden');
      renderAdminProducts();
    });
  }

  if (btnReloadAdminProducts) {
    btnReloadAdminProducts.addEventListener('click', () => {
      showToast('Đang tải lại kho hàng...');
      loadAdminProducts();
    });
  }

  async function syncProductsToHostinger(newProductsList, successMsg) {
    try {
      const fd = new FormData();
      fd.append('payload', JSON.stringify({ mode: 'replace', products: newProductsList }));

      const res = await fetch('https://shop.saigoncacanh.com/save-products.php?token=041188', {
        method: 'POST',
        body: fd
      });

      const json = await res.json();
      if (json && json.success) {
        adminProducts = newProductsList;
        renderAdminProducts();
        showToast(successMsg || 'Đã đồng bộ thay đổi lên shop.saigoncacanh.com!');
      } else {
        alert('Lỗi khi lưu lên máy chủ: ' + (json ? json.error : 'Lỗi kết nối'));
      }
    } catch(e) {
      alert('Không thể kết nối máy chủ: ' + e.message);
    }
  }

  async function deleteSingleAdminProduct(pId) {
    const item = adminProducts.find(p => p.id === pId);
    if (!item) return;

    if (confirm(`Anh Phát có chắc chắn muốn xóa sản phẩm:\n"${item.title}"?`)) {
      const updated = adminProducts.filter(p => p.id !== pId);
      await syncProductsToHostinger(updated, 'Đã xóa sản phẩm khỏi Siêu Thị!');
    }
  }

  if (btnDeleteSelectedProducts) {
    btnDeleteSelectedProducts.addEventListener('click', async () => {
      const checked = Array.from(adminCardsGrid.querySelectorAll('.chk-admin-item:checked')).map(c => c.getAttribute('data-id'));
      if (checked.length === 0) {
        alert('Vui lòng chọn ít nhất 1 sản phẩm để xóa!');
        return;
      }

      if (confirm(`Anh Phát có chắc chắn muốn xóa ${checked.length} sản phẩm đã chọn khỏi Siêu thị?`)) {
        const updated = adminProducts.filter(p => !checked.includes(p.id));
        await syncProductsToHostinger(updated, `Đã xóa thành công ${checked.length} sản phẩm khỏi Siêu thị!`);
      }
    });
  }

  if (btnPurgeStore) {
    btnPurgeStore.addEventListener('click', async () => {
      if (confirm('⚠️ CẢNH BÁO: Anh Phát có chắc chắn muốn XÓA TRỐNG TOÀN BỘ KHO SẢN PHẨM trên Siêu thị?')) {
        try {
          const res = await fetch('https://shop.saigoncacanh.com/purge.php?token=041188');
          const json = await res.json();
          if (json && json.success) {
            adminProducts = [];
            renderAdminProducts();
            alert('🎉 ĐÃ XÓA TRỐNG TOÀN BỘ KHO SẢN PHẨM TRÊN SIÊU THỊ THÀNH CÔNG!');
          } else {
            alert('Lỗi xóa kho: ' + (json ? json.error : 'Lỗi máy chủ'));
          }
        } catch(e) {
          alert('Không thể kết nối máy chủ: ' + e.message);
        }
      }
    });
  }

  // ==========================================
  // 1-CLICK SOCIAL POST GENERATOR MODAL
  // ==========================================
  const modalSocialPost = document.getElementById('modal-social-post');
  const modalPostImg = document.getElementById('modal-post-img');
  const modalPostTitle = document.getElementById('modal-post-title');
  const modalPostPrice = document.getElementById('modal-post-price');
  const modalPostStyle = document.getElementById('modal-post-style');
  const modalPostOutput = document.getElementById('modal-post-output');
  const btnClosePostModal = document.getElementById('btn-close-post-modal');
  const btnCopyModalPost = document.getElementById('btn-copy-modal-post');
  const modalPostImgDownload = document.getElementById('modal-post-img-download');

  let currentPostItem = null;

  function openSocialPostModal(item) {
    currentPostItem = item;
    modalPostImg.src = item.image || 'https://via.placeholder.com/150';
    modalPostTitle.textContent = item.title;
    modalPostPrice.textContent = item.price || 'Giá cực tốt';
    modalPostImgDownload.href = item.image;

    generatePostScript();
    modalSocialPost.classList.remove('hidden');
  }

  function formatVietnamesePrice(priceStr) {
    if (!priceStr) return 'Deal Ngon Shopee';
    let clean = priceStr.replace('₫', '').replace('đ', '').replace('Giá', '').trim();
    let num = parseFloat(clean);
    if (!isNaN(num)) {
      if (num < 1000 && num > 0) {
        num = num * 10000;
      }
      return Math.round(num).toLocaleString('vi-VN') + 'đ';
    }
    return priceStr.endsWith('đ') ? priceStr : priceStr + 'đ';
  }

  function generatePostScript() {
    if (!currentPostItem) return;
    const style = modalPostStyle.value;
    const title = currentPostItem.title;
    let price = formatVietnamesePrice(currentPostItem.price);
    const affId = globalAffIdInput.value.trim() || '17384730538';

    let rawUrl = currentPostItem.shopeeUrl || '';
    let shortLink = '';

    // Prevent double-nesting if link is already an r.php shortlink or an_redir link
    if (rawUrl.includes('shop.saigoncacanh.com/r.php?u=')) {
      shortLink = rawUrl;
    } else if (rawUrl.includes('s.shopee.vn/an_redir')) {
      const b64 = btoa(unescape(encodeURIComponent(rawUrl)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      shortLink = `https://shop.saigoncacanh.com/r.php?u=${b64}`;
    } else {
      const encoded = encodeURIComponent(rawUrl);
      const fullLink = `https://s.shopee.vn/an_redir?origin_link=${encoded}&affiliate_id=${affId}&sub_id=social-post`;
      const b64 = btoa(unescape(encodeURIComponent(fullLink)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      shortLink = `https://shop.saigoncacanh.com/r.php?u=${b64}`;
    }

    let text = '';

    if (style === 'flash') {
      text = `🔥 DEAL CHỢP NHOÁNG - GIÁ SIÊU SỐC TRONG NGÀY! 🔥\n\n🐠 ${title}\n💰 Giá Sale Hot: ${price}\n\n🚀 Đặt mua giao nhanh tận nhà tại đây:\n👉 ${shortLink}\n\n⚡ Mã giảm giá & Freeship tự động áp dụng khi thanh toán!`;
    } else if (style === 'review') {
      text = `⭐ REVIEW SẢN PHẨM THỦY SINH ĐƯỢC ĐÁNH GIÁ 5 SAO ⭐\n\n👉 Anh em mê cá cảnh không nên bỏ qua món này: ${title}\n💵 Giá tốt nhất hôm nay: ${price}\n\n🛒 Link mua hàng chính hãng Shopee bên dưới:\n👉 ${shortLink}\n\n(Hàng chuẩn 100%, được kiểm tra trước khi nhận!)`;
    } else {
      text = `🐟 ${title}\n👉 Mua ngay tại Shopee: ${shortLink}\n💰 Giá cực mềm: ${price}`;
    }

    modalPostOutput.value = text;
  }

  if (modalPostStyle) {
    modalPostStyle.addEventListener('change', generatePostScript);
  }

  if (btnClosePostModal) {
    btnClosePostModal.addEventListener('click', () => {
      modalSocialPost.classList.add('hidden');
    });
  }

  if (btnCopyModalPost) {
    btnCopyModalPost.addEventListener('click', () => {
      if (modalPostOutput.value) {
        navigator.clipboard.writeText(modalPostOutput.value);
        showToast('Đã sao chép kịch bản bài đăng!');
      }
    });
  }

  // ==========================================
  // ANALYTICS & CLICK STATS CHART ENGINE
  // ==========================================
  let clickChartInstance = null;
  const statTotalClicks = document.getElementById('stat-total-clicks');
  const statTotalProds = document.getElementById('stat-total-prods');
  const statTopItemName = document.getElementById('stat-top-item-name');
  const analyticsTopBody = document.getElementById('analytics-top-body');
  const btnRefreshAnalytics = document.getElementById('btn-refresh-analytics');

  async function loadAnalytics() {
    if (!analyticsTopBody) return;
    analyticsTopBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #888;"><i class="fa-solid fa-spinner fa-spin"></i> Đang nạp thống kê từ shop.saigoncacanh.com...</td></tr>';

    try {
      const res = await fetch(`https://shop.saigoncacanh.com/get-analytics.php?v=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          renderAnalyticsData(json);
        }
      }
    } catch(e) {
      console.error('Analytics fetch error:', e);
      analyticsTopBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Không thể kết nối máy chủ thống kê.</td></tr>';
    }
  }

  function renderAnalyticsData(data) {
    if (statTotalClicks) statTotalClicks.textContent = data.total_clicks || 0;
    if (statTotalProds) statTotalProds.textContent = data.total_products || 0;

    const topList = data.top_products || [];
    if (statTopItemName) {
      statTopItemName.textContent = topList.length > 0 ? topList[0].title : 'Chưa có dữ liệu';
    }

    // Draw Chart.js Line Chart
    const ctx = document.getElementById('clickChart')?.getContext('2d');
    if (ctx && data.chart) {
      if (clickChartInstance) clickChartInstance.destroy();

      clickChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.chart.labels,
          datasets: [{
            label: 'Lượt Click Mua Nay',
            data: data.chart.data,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#f97316',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aaa' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aaa' }, beginAtZero: true }
          }
        }
      });
    }

    // Render Ranking Table
    if (topList.length === 0) {
      analyticsTopBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #888;">Chưa có dữ liệu lượt click. Hãy chia sẻ Siêu thị để bắt đầu đếm click!</td></tr>';
      return;
    }

    analyticsTopBody.innerHTML = '';
    topList.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      
      let medal = `<strong style="color: #aaa;">#${idx + 1}</strong>`;
      if (idx === 0) medal = '🥇';
      else if (idx === 1) medal = '🥈';
      else if (idx === 2) medal = '🥉';

      tr.innerHTML = `
        <td style="padding: 10px; text-align: center; font-size: 16px;">${medal}</td>
        <td style="padding: 10px;"><img src="${item.image}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;"></td>
        <td style="padding: 10px; font-weight: 600; font-size: 13px; color: #fff;">${item.title}</td>
        <td style="padding: 10px;"><span style="background: rgba(255,255,255,0.1); color: #38bdf8; padding: 2px 6px; border-radius: 10px; font-size: 11px;">${item.categoryName}</span></td>
        <td style="padding: 10px; text-align: center; font-weight: 800; color: #f97316; font-size: 14px;">${item.clicks}</td>
      `;
      analyticsTopBody.appendChild(tr);
    });
  }

  if (btnRefreshAnalytics) {
    btnRefreshAnalytics.addEventListener('click', () => {
      showToast('Đang làm mới thống kê...');
      loadAnalytics();
    });
  }

  // Load products automatically if opening products tab directly
  if (window.location.hash === '#store-products') {
    navItems.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-tab="products"]')?.classList.add('active');
    tabPanes.forEach(pane => {
      if (pane.id === 'tab-products') pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    });
    loadAdminProducts();
  } else if (window.location.hash === '#analytics') {
    navItems.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-tab="analytics"]')?.classList.add('active');
    tabPanes.forEach(pane => {
      if (pane.id === 'tab-analytics') pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    });
    loadAnalytics();
  }
});
