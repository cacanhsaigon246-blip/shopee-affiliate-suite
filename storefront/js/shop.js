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

  // Helper function to remove Vietnamese diacritics / tones for accent-insensitive search
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
    try {
      str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch(e){}
    return str;
  }

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

  // Mulberry32 Seeded Random Generator for Daily Product Rotation
  function seededRandom(seed) {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 8, t | 4);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  function getTodaySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  // AUTO-CLEAN & DAILY SMART SHUFFLE FILTER
  function getActiveProducts() {
    if (typeof PRODUCTS_DATA === 'undefined') return [];
    const active = PRODUCTS_DATA.filter(item => item.status === 'active');

    // Deterministic Daily Shuffle based on today's date seed (YYYYMMDD)
    const seed = getTodaySeed();
    const shuffled = [...active];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const rand = seededRandom(seed + i);
      const j = Math.floor(rand * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  const PAGE_SIZE = 24;
  let currentPage = 1;

  function renderProducts(isLoadMore = false) {
    const activeData = getActiveProducts();
    const cleanSearchQuery = removeVietnameseTones(searchQuery);
    
    const filtered = activeData.filter(item => {
      const matchCat = currentCategory === 'all' || item.category === currentCategory;
      if (!matchCat) return false;
      if (!cleanSearchQuery) return true;

      const titleClean = removeVietnameseTones(item.title);
      const catClean = removeVietnameseTones(item.categoryName);

      return titleClean.includes(cleanSearchQuery) || catClean.includes(cleanSearchQuery);
    });

    productCount.textContent = filtered.length;

    if (!isLoadMore) {
      currentPage = 1;
      productGrid.innerHTML = '';
    }

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      productGrid.classList.add('hidden');
      removeLoadMoreButton();
      return;
    }

    emptyState.classList.add('hidden');
    productGrid.classList.remove('hidden');

    const visibleItems = filtered.slice(0, currentPage * PAGE_SIZE);

    const itemsToDraw = isLoadMore 
      ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) 
      : visibleItems;

    itemsToDraw.forEach((item, idx) => {
      const affLink = getAffiliateLink(item.shopeeUrl, item.id, item.title);
      const card = document.createElement('div');
      card.className = 'product-card';
      
      let promoTag = item.discount || 'HOT';
      if (idx % 3 === 0) promoTag = '🔥 TOP BÁN CHẠY';
      else if (idx % 3 === 1) promoTag = '⚡ FLASH SALE';
      else promoTag = '🚚 FREESHIP XTRA';

      card.innerHTML = `
        <div class="product-img-wrapper">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <span class="discount-tag">${promoTag}</span>
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
            <a href="${affLink}" target="_blank" class="btn-buy-shopee" data-id="${item.id}">
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

    productGrid.querySelectorAll('.product-img-wrapper').forEach(wrap => {
      if (!wrap.hasAttribute('data-lightbox-bound')) {
        wrap.setAttribute('data-lightbox-bound', 'true');
        wrap.addEventListener('click', (e) => {
          const card = wrap.closest('.product-card');
          if (card) {
            const img = wrap.querySelector('img')?.src;
            const title = card.querySelector('.product-title')?.textContent;
            const buyLink = card.querySelector('.btn-buy-shopee')?.href;
            openLightbox(img, title, buyLink);
          }
        });
      }
    });

    productGrid.querySelectorAll('.btn-buy-shopee').forEach(btn => {
      if (!btn.hasAttribute('data-tracked')) {
        btn.setAttribute('data-tracked', 'true');
        btn.addEventListener('click', () => {
          const pId = btn.getAttribute('data-id');
          if (pId) {
            try { fetch(`https://shop.saigoncacanh.com/track-click.php?id=${encodeURIComponent(pId)}`, { mode: 'no-cors' }); } catch(e){}
          }
        });
      }
    });

    productGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
      if (!btn.hasAttribute('data-tracked')) {
        btn.setAttribute('data-tracked', 'true');
        btn.addEventListener('click', () => {
          const pId = btn.getAttribute('data-id');
          addToWishlist(pId);
        });
      }
    });

    updateLoadMoreButton(filtered.length);
  }

  function updateLoadMoreButton(totalFilteredCount) {
    removeLoadMoreButton();

    const loadedCount = currentPage * PAGE_SIZE;
    if (loadedCount < totalFilteredCount) {
      const remaining = totalFilteredCount - loadedCount;
      const btnBox = document.createElement('div');
      btnBox.id = 'load-more-wrapper';
      btnBox.style.cssText = 'grid-column: 1 / -1; text-align: center; margin-top: 30px; margin-bottom: 20px;';
      btnBox.innerHTML = `
        <button id="btn-load-more-prods" class="btn-load-more" style="background: linear-gradient(135deg, #ff5722, #f97316); color: #fff; border: none; padding: 14px 32px; border-radius: 30px; font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35); transition: transform 0.2s ease;">
          <i class="fa-solid fa-angles-down"></i> XEM THÊM ${Math.min(PAGE_SIZE, remaining)} SẢN PHẨM (Còn ${remaining.toLocaleString('vi-VN')} món)
        </button>
      `;
      productGrid.parentElement.appendChild(btnBox);

      document.getElementById('btn-load-more-prods').addEventListener('click', () => {
        currentPage++;
        renderProducts(true);
      });
    }
  }

  function removeLoadMoreButton() {
    const existing = document.getElementById('load-more-wrapper');
    if (existing) existing.remove();
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

  // Lightbox Modal Functions
  const imageLightboxModal = document.getElementById('image-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxBuyBtn = document.getElementById('lightbox-buy-btn');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');

  function openLightbox(imgSrc, title, buyLink) {
    if (!imageLightboxModal) return;
    lightboxImg.src = imgSrc || '';
    lightboxTitle.textContent = title || '';
    lightboxBuyBtn.href = buyLink || '#';
    imageLightboxModal.classList.remove('hidden');
  }

  if (btnCloseLightbox) {
    btnCloseLightbox.addEventListener('click', () => {
      imageLightboxModal.classList.add('hidden');
    });
  }

  if (imageLightboxModal) {
    imageLightboxModal.addEventListener('click', (e) => {
      if (e.target === imageLightboxModal) {
        imageLightboxModal.classList.add('hidden');
      }
    });
  }

  // Initial Render
  renderProducts();
});
