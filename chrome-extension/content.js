// Content script to extract real product info & images from current Shopee page DOM
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape_shopee_page') {
    const products = [];
    const affId = request.affId || '17384730538';

    // 1. Helper function to create affiliate URL
    function makeAffUrl(rawUrl) {
      const encUrl = encodeURIComponent(rawUrl);
      const b64 = btoa(unescape(encodeURIComponent(`https://s.shopee.vn/an_redir?origin_link=${encUrl}&affiliate_id=${affId}`)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return `https://shop.saigoncacanh.com/r.php?u=${b64}`;
    }

    // 2. Helper function to categorize products based on title keywords
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

    // A. SINGLE PRODUCT PAGE SCRAPE
    const currUrl = window.location.href;
    const isSingleProduct = currUrl.includes('shopee.vn') && (currUrl.includes('-i.') || currUrl.includes('/product/'));

    if (isSingleProduct) {
      // Title
      let rawTitle = document.querySelector('meta[property="og:title"]')?.content || 
                         document.querySelector('h1')?.textContent || 
                         document.title;
      const cleanTitle = rawTitle.replace(/-\s*Shopee\s*Việt\s*Nam/gi, '').replace(/\|\s*Shopee\s*Việt\s*Nam/gi, '').trim();

      // Image
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

      // Price
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
          shopeeUrl: makeAffUrl(currUrl),
          status: 'active'
        });
      }
    }

    // B. MULTI-PRODUCT LIST PAGE SCRAPE (Search / Shop / Category / Flash Sale)
    const productCards = document.querySelectorAll(
      'li.shopee-search-item-result, div[data-sqe="item"], div.shopee-search-item-result__item, div.col-xs-2-4, div.shopee-item-card'
    );

    productCards.forEach((card, idx) => {
      const imgEl = card.querySelector('img[src*="susercontent"]') || card.querySelector('img');
      const titleEl = card.querySelector('div[data-sqe="name"]') || card.querySelector('div.C32XTV') || card.querySelector('img[alt]');
      const priceEl = card.querySelector('span._1E9_f') || card.querySelector('div.vP2osn') || card.querySelector('span.ZEgDH9');
      const linkEl = card.querySelector('a[href*="shopee.vn"]') || card.querySelector('a[href*="-i."]') || card.querySelector('a');

      if (imgEl && linkEl) {
        const title = titleEl ? (titleEl.textContent || titleEl.alt) : (imgEl.alt || 'Sản Phẩm Shopee');
        const imgUrl = imgEl.src || imgEl.getAttribute('data-src') || '';
        let href = linkEl.href || linkEl.getAttribute('href') || '';
        if (href.startsWith('/')) href = 'https://shopee.vn' + href;

        if (imgUrl && href && !imgUrl.includes('placeholder')) {
          const catInfo = detectCategory(title);
          products.push({
            id: `sp-${Date.now()}-${idx}`,
            title: title.trim(),
            category: catInfo.cat,
            categoryName: catInfo.catName,
            price: priceEl ? priceEl.textContent.trim() : 'Deal Ngon',
            originalPrice: 'Shopee Deal',
            discount: 'HOT',
            rating: '5.0',
            sold: 'Shopee Mall',
            image: imgUrl,
            shopeeUrl: makeAffUrl(href),
            status: 'active'
          });
        }
      }
    });

    sendResponse({ success: true, count: products.length, products: products });
  }
});
