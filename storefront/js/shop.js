document.addEventListener('DOMContentLoaded', () => {
  const AFFILIATE_ID = "17384730538";

  // Elements
  const productGrid = document.getElementById('product-grid');
  const productCount = document.getElementById('product-count');
  const sectionTitle = document.getElementById('section-title');
  const searchInput = document.getElementById('shop-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const emptyState = document.getElementById('empty-state');
  const btnResetFilter = document.getElementById('btn-reset-filter');
  const fallbackAlert = document.getElementById('fallback-alert');
  const btnCloseAlert = document.getElementById('btn-close-alert');
  const catPills = document.querySelectorAll('.cat-pill');

  // Cart / Wishlist Elements
  const btnOpenCart = document.getElementById('btn-open-cart');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCount = document.getElementById('cart-count');
  const cartTotalCount = document.getElementById('cart-total-count');
  const btnCheckoutShopee = document.getElementById('btn-checkout-shopee');
  const shopToast = document.getElementById('shop-toast');
  const shopToastMsg = document.getElementById('shop-toast-msg');

  let currentCategory = 'all';
  let searchQuery = '';
  let wishlist = [];

  // Check URL parameters for fallback / broken link redirection
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('fallback') || urlParams.has('broken') || urlParams.has('search')) {
    fallbackAlert.classList.remove('hidden');
    if (urlParams.has('search')) {
      searchQuery = urlParams.get('search').toLowerCase();
      searchInput.value = urlParams.get('search');
      btnClearSearch.classList.remove('hidden');
    }
  }

  if (btnCloseAlert) {
    btnCloseAlert.addEventListener('click', () => {
      fallbackAlert.classList.add('hidden');
    });
  }

  // Toast function
  function showToast(msg) {
    shopToastMsg.textContent = msg;
    shopToast.classList.remove('hidden');
    setTimeout(() => {
      shopToast.classList.add('hidden');
    }, 2800);
  }

  // Build Affiliate Link (Fixes invalid 0 shopid & preserves search keyword parameter)
  function getAffiliateLink(shopeeSearchOrUrl, productId, title) {
    if (!shopeeSearchOrUrl) return '#';
    
    // If link is already an affiliate short link, return directly
    if (shopeeSearchOrUrl.includes('r.php') || shopeeSearchOrUrl.includes('s.shopee.vn') || shopeeSearchOrUrl.includes('shope.ee') || shopeeSearchOrUrl.includes('ulvis.net')) {
      return shopeeSearchOrUrl;
    }

    let cleanUrl = shopeeSearchOrUrl;
    try { cleanUrl = decodeURIComponent(shopeeSearchOrUrl); } catch(e){}

    // Fix internal affiliate portal offer links or invalid 0 shopid links
    if (cleanUrl.includes('affiliate.shopee.vn') || cleanUrl.includes('/a-i.0.') || !cleanUrl.includes('shopee.vn')) {
      const cleanTitle = (title || 'phu kien ca canh').trim();
      cleanUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(cleanTitle)}`;
    }

    // Only strip extraParams tracking bloat, PRESERVE ?keyword= search query!
    const extraIdx = cleanUrl.indexOf('extraParams=');
    if (extraIdx > -1) {
      cleanUrl = cleanUrl.substring(0, extraIdx - 1);
    }

    const encoded = encodeURIComponent(cleanUrl);
    return `https://s.shopee.vn/an_redir?origin_link=${encoded}&affiliate_id=${AFFILIATE_ID}&sub_id=shop-supermarket-${productId}`;
  }

  // AUTO-CLEAN FILTER: Filters out any out_of_stock products automatically!
  function getActiveProducts() {
    if (typeof PRODUCTS_DATA === 'undefined') return [];
    return PRODUCTS_DATA.filter(item => item.status === 'active');
  }

  // Render Products Grid
  function renderProducts() {
    const activeData = getActiveProducts();
    
    const filtered = activeData.filter(item => {
      const matchCat = currentCategory === 'all' || item.category === currentCategory;
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) || 
        item.categoryName.toLowerCase().includes(searchQuery);
      return matchCat && matchSearch;
    });

    productGrid.innerHTML = '';
    productCount.textContent = filtered.length;

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      productGrid.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      productGrid.classList.remove('hidden');

      filtered.forEach(item => {
        const affLink = getAffiliateLink(item.shopeeUrl, item.id, item.title);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <div class="product-img-wrapper">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <span class="discount-tag">${item.discount}</span>
            <span class="shopee-badge"><i class="fa-solid fa-bag-shopping"></i> Shopee</span>
          </div>
          <div class="product-info">
            <span class="product-cat">${item.categoryName}</span>
            <h3 class="product-title" title="${item.title}">${item.title}</h3>
            <div class="price-box">
              <span class="current-price">${item.price}</span>
              <span class="original-price">${item.originalPrice}</span>
            </div>
            <div class="product-actions">
              <a href="${affLink}" target="_blank" class="btn-buy-shopee">
                <i class="fa-solid fa-bolt"></i> MUA NAY
              </a>
              <button class="btn-add-cart" data-id="${item.id}" title="Thêm vào danh sách mua">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        `;
        productGrid.appendChild(card);
      });

      // Attach Add Cart Listeners
      productGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = btn.getAttribute('data-id');
          addToWishlist(pId);
        });
      });
    }
  }

  // Category Pill Switcher
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-cat');
      
      if (currentCategory === 'all') {
        sectionTitle.textContent = '🔥 DẤU ẤN HOT - SẢN PHẨM BÁN CHẠY NHẤT';
      } else {
        sectionTitle.textContent = `🛒 KỆ HÀNG: ${pill.textContent.trim().toUpperCase()}`;
      }
      renderProducts();
    });
  });

  // Search Logic
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    if (searchQuery) {
      btnClearSearch.classList.remove('hidden');
    } else {
      btnClearSearch.classList.add('hidden');
    }
    renderProducts();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderProducts();
  });

  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      currentCategory = 'all';
      catPills.forEach(p => p.classList.remove('active'));
      document.querySelector('[data-cat="all"]').classList.add('active');
      btnClearSearch.classList.add('hidden');
      renderProducts();
    });
  }

  // Wishlist Cart Logic
  function addToWishlist(pId) {
    const activeData = getActiveProducts();
    const product = activeData.find(p => p.id === pId);
    if (!product) return;

    if (!wishlist.some(item => item.id === pId)) {
      wishlist.push(product);
      updateWishlistUI();
      showToast('Đã thêm sản phẩm vào danh sách mua Shopee!');
    } else {
      showToast('Sản phẩm đã có trong danh sách của bạn!');
    }
  }

  function removeFromWishlist(pId) {
    wishlist = wishlist.filter(p => p.id !== pId);
    updateWishlistUI();
  }

  function updateWishlistUI() {
    cartCount.textContent = wishlist.length;
    cartTotalCount.textContent = `${wishlist.length} món`;
    cartItemsContainer.innerHTML = '';

    if (wishlist.length === 0) {
      cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Danh sách mua sắm đang trống.</p>`;
      return;
    }

    wishlist.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.price}</div>
        </div>
        <button class="btn-remove-item" data-id="${item.id}" style="background: transparent; border: none; color: #ef4444; cursor: pointer;">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      cartItemsContainer.appendChild(div);
    });

    cartItemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        removeFromWishlist(id);
      });
    });
  }

  // Open / Close Cart Drawer
  function openCart() {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.remove('hidden');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.add('hidden');
  }

  btnOpenCart.addEventListener('click', openCart);
  btnCloseCart.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);

  // Checkout All to Shopee
  btnCheckoutShopee.addEventListener('click', () => {
    if (wishlist.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm!');
      return;
    }

    wishlist.forEach(item => {
      const affLink = getAffiliateLink(item.shopeeUrl, item.id, item.title);
      window.open(affLink, '_blank');
    });

    showToast('Đã mở tất cả sản phẩm trên Shopee!');
    closeCart();
  });

  // Initial Render
  renderProducts();
});
