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
  // STOREFRONT PRODUCT MANAGER - PRODUCT CARDS GRID LAYOUT
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
          <a href="${item.shopeeUrl}" target="_blank" class="btn-admin-view" title="Xem trên Shopee">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Shopee
          </a>
        </div>
      `;
      adminCardsGrid.appendChild(card);
    });

    // Attach checkbox listeners to toggle .selected style on card
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

    // Attach single delete listener
    adminCardsGrid.querySelectorAll('.btn-delete-single-admin').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        deleteSingleAdminProduct(pId);
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

  // Load products automatically if opening products tab directly
  if (window.location.hash === '#store-products') {
    navItems.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-tab="products"]')?.classList.add('active');
    tabPanes.forEach(pane => {
      if (pane.id === 'tab-products') pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    });
    loadAdminProducts();
  }
});
