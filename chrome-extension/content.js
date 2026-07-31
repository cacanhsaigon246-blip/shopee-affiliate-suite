// Content script to extract real product info & images from current Shopee page DOM or Affiliate Portal
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape_shopee_page') {
    const products = [];
    const affId = request.affId || '17384730538';
    const seenTitles = new Set();

    // Helper to create clean affiliate URL pointing directly to public Shopee item page or search
    function makeAffUrl(rawUrl, title) {
      let cleanUrl = rawUrl || '';
      try { cleanUrl = decodeURIComponent(cleanUrl); } catch (e) {}

      // If URL is an internal offer link without shopid, check if it has itemid/shopid format
      if (cleanUrl.includes('affiliate.shopee.vn') || !cleanUrl.includes('shopee.vn')) {
        // Look for -i.SHOPID.ITEMID format
        const itemMatch = cleanUrl.match(/-i\.(\d+)\.(\d+)/);
        const prodMatch = cleanUrl.match(/\/product\/(\d+)\/(\d+)/);
        if (itemMatch) {
          cleanUrl = `https://shopee.vn/product/${itemMatch[1]}/${itemMatch[2]}`;
        } else if (prodMatch) {
          cleanUrl = `https://shopee.vn/product/${prodMatch[1]}/${prodMatch[2]}`;
        } else {
          // Fallback to keyword search URL with full title
          cleanUrl = `https://shopee.vn/search?keyword=${encodeURIComponent((title || 'phu kien ca canh').trim())}`;
        }
      }

      const encUrl = encodeURIComponent(cleanUrl);
      const targetAffUrl = `https://s.shopee.vn/an_redir?origin_link=${encUrl}&affiliate_id=${affId}`;
      const b64 = btoa(unescape(encodeURIComponent(targetAffUrl)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return `https://shop.saigoncacanh.com/r.php?u=${b64}`;
    }

    // Helper to categorize products based on title keywords
    function detectCategory(title) {
      const cleanT = (title || '').toLowerCase();
      if (cleanT.includes('thức ăn') || cleanT.includes('cám') || cleanT.includes('mồi') || cleanT.includes('tảo') || cleanT.includes('artemia')) {
        return { cat: 'thuc-an', catName: 'Thức Ăn & Dinh Dưỡng' };
      } else if (cleanT.includes('bơm') || cleanT.includes('lọc') || cleanT.includes('sứ') || cleanT.includes('bông') || cleanT.includes('mat')) {
        return { cat: 'bom-loc', catName: 'Bơm & Thiết Bị Lọc' };
      } else if (cleanT.includes('đèn') || cleanT.includes('led') || cleanT.includes('máng')) {
        return { cat: 'den-led', catName: 'Đèn LED & Thủy Sinh' };
      } else if (cleanT.includes('vi sinh') || cleanT.includes('men') || cleanT.includes('thuốc') || cleanT.includes('dưỡng') || cleanT.includes('vitamin')) {
        return { cat: 'thuoc-men', catName: 'Thuốc & Men Vi Sinh' };
      }
      return { cat: 'phu-kien', catName: 'Phụ Kiện Bể Cá' };
    }

    // 1. Single Product Page Scrape
    const currUrl = window.location.href;
    const isSingleProduct = currUrl.includes('shopee.vn') && (currUrl.includes('-i.') || currUrl.includes('/product/')) && !currUrl.includes('affiliate.shopee.vn');

    if (isSingleProduct) {
      let rawTitle = document.querySelector('meta[property="og:title"]')?.content || 
                         document.querySelector('h1')?.textContent || 
                         document.title;
      const cleanTitle = rawTitle.replace(/-\s*Shopee\s*Việt\s*Nam/gi, '').replace(/\|\s*Shopee\s*Việt\s*Nam/gi, '').trim();

      let realImg = document.querySelector('meta[property="og:image"]')?.content || '';
      if (!realImg) {
        const mainImgEl = document.querySelector('div[style*="background-image"]') || 
                          document.querySelector('img[src*="susercontent"]') || 
                          document.querySelector('picture img');
        if (mainImgEl) {
          if (mainImgEl.tagName === 'DIV') {
            const bgMatch = mainImgEl.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            if (bgMatch) realImg = bgMatch[1];
          } else {
            realImg = mainImgEl.src || mainImgEl.getAttribute('data-src') || '';
          }
        }
      }

      let priceText = 'Deal Ngon';
      const priceEl = document.querySelector('._1x9_f') || 
                      document.querySelector('.pq8Piy') || 
                      document.querySelector('div[style*="color: rgb(238, 77, 45)"]') ||
                      document.querySelector('div[style*="color: rgb(255, 66, 78)"]');
      if (priceEl && priceEl.textContent.trim()) {
        priceText = priceEl.textContent.trim();
      }

      if (realImg && cleanTitle) {
        const catInfo = detectCategory(cleanTitle);
        products.push({
          id: 'sp-' + Date.now(),
          title: cleanTitle,
          category: catInfo.cat,
          categoryName: catInfo.catName,
          price: priceText,
          originalPrice: 'Shopee Deal',
          discount: 'HOT',
          rating: '5.0',
          sold: 'Shopee Mall',
          image: realImg,
          shopeeUrl: makeAffUrl(currUrl, cleanTitle),
          status: 'active'
        });
        seenTitles.add(cleanTitle.toLowerCase());
      }
    }

    // 2. Multi-Product Bulk Scrape (Shopee.vn Search / Shop / Category & Affiliate Portal)
    const productCards = document.querySelectorAll(
      'li.shopee-search-item-result, div[data-sqe="item"], div.shopee-search-item-result__item, div.col-xs-2-4, div.shopee-item-card, div[class*="offer-item"], div[class*="product-item"], div[class*="ProductCard"], div[class*="offer-card"], div[class*="product-offer"]'
    );

    if (productCards.length > 0) {
      productCards.forEach((card, idx) => {
        const imgEl = card.querySelector('img[src*="susercontent"]') || card.querySelector('img[src*="shopee"]') || card.querySelector('img');
        const titleEl = card.querySelector('div[data-sqe="name"]') || card.querySelector('div[class*="title"]') || card.querySelector('div[class*="name"]') || card.querySelector('div.C32XTV') || card.querySelector('img[alt]');
        const priceEl = card.querySelector('span._1E9_f') || card.querySelector('div[class*="price"]') || card.querySelector('div.vP2osn') || card.querySelector('span.ZEgDH9');
        // Search for direct product links on card or child elements
        const linkEl = card.querySelector('a[href*="-i."]') || card.querySelector('a[href*="/product/"]') || card.querySelector('a[href*="shopee.vn"]') || card.querySelector('a');

        if (imgEl && (titleEl || imgEl.alt)) {
          const title = titleEl ? (titleEl.textContent || titleEl.alt) : (imgEl.alt || 'Sản Phẩm Shopee');
          const imgUrl = imgEl.src || imgEl.getAttribute('data-src') || '';
          let href = linkEl ? (linkEl.href || linkEl.getAttribute('href') || '') : '';

          const cleanTKey = title.trim().toLowerCase();

          if (imgUrl && title.trim().length > 3 && !imgUrl.includes('placeholder') && !seenTitles.has(cleanTKey)) {
            seenTitles.add(cleanTKey);
            const catInfo = detectCategory(title);
            let priceText = 'Deal Ngon';
            if (priceEl && priceEl.textContent.trim()) {
              priceText = priceEl.textContent.trim().replace(/^₫/, '₫ ');
            }

            products.push({
              id: `sp-${Date.now()}-${idx}`,
              title: title.trim(),
              category: catInfo.cat,
              categoryName: catInfo.catName,
              price: priceText,
              originalPrice: 'Shopee Deal',
              discount: 'HOT',
              rating: '5.0',
              sold: 'Shopee Mall',
              image: imgUrl,
              shopeeUrl: makeAffUrl(href, title.trim()),
              status: 'active'
            });
          }
        }
      });
    }

    sendResponse({ success: true, count: products.length, products: products });
  }
});
