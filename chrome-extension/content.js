// Content script to extract product info from current Shopee page DOM
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape_shopee_page') {
    const products = [];
    const affId = request.affId || '17384730538';

    // Check if Single Product Page
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || document.title;
    const ogImage = document.querySelector('meta[property="og:image"]')?.content || 
                    document.querySelector('div[style*="background-image"]')?.style?.backgroundImage?.match(/url\(["']?(.*?)["']?\)/)?.[1];
    
    // 1. Single Product Page Scrape
    if (window.location.href.includes('shopee.vn') && (window.location.href.includes('-i.') || window.location.href.includes('/product/'))) {
      let priceText = 'Deal Ngon';
      const priceEl = document.querySelector('._1x9_f'), documentQuerySelector = document.querySelector('.pq8Piy') || document.querySelector('div[style*="color: rgb(238, 77, 45)"]');
      if (priceEl) priceText = priceEl.textContent;

      let realImg = ogImage || '';
      if (!realImg) {
        const imgEl = document.querySelector('img._39-W-B') || document.querySelector('img[src*="susercontent"]');
        if (imgEl) realImg = imgEl.src;
      }

      if (realImg) {
        // Construct affiliate redirect link
        const encUrl = encodeURIComponent(window.location.href);
        const b64 = btoa(unescape(encodeURIComponent(`https://s.shopee.vn/an_redir?origin_link=${encUrl}&affiliate_id=${affId}`)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const affShortUrl = `https://shop.saigoncacanh.com/r.php?u=${b64}`;

        products.push({
          id: 'sp-' + Date.now(),
          title: ogTitle.replace('- Shopee Việt Nam', '').trim(),
          category: 'phu-kien',
          categoryName: 'Phụ Kiện Bể Cá',
          price: priceText,
          originalPrice: 'Shopee Deal',
          discount: 'HOT',
          rating: '5.0',
          sold: 'Shopee Mall',
          image: realImg,
          shopeeUrl: affShortUrl,
          status: 'active'
        });
      }
    }

    // 2. Multi-Product List Page Scrape (Search results / Shop / Category / Affiliate Portal)
    const productCards = document.querySelectorAll('li.shopee-search-item-result, div[data-sqe="item"], div.shopee-search-item-result__item, div.col-xs-2-4');
    productCards.forEach((card, idx) => {
      const imgEl = card.querySelector('img[src*="susercontent"]') || card.querySelector('img');
      const titleEl = card.querySelector('div[data-sqe="name"]') || card.querySelector('div.C32XTV') || card.querySelector('img[alt]');
      const priceEl = card.querySelector('span._1E9_f') || card.querySelector('div.vP2osn') || card.querySelector('span.ZEgDH9');
      const linkEl = card.querySelector('a[href*="shopee.vn"]') || card.querySelector('a');

      if (imgEl && (titleEl || imgEl.alt) && linkEl) {
        const title = titleEl ? (titleEl.textContent || titleEl.alt) : 'Sản Phẩm Shopee';
        const imgUrl = imgEl.src || imgEl.getAttribute('data-src') || '';
        let href = linkEl.href || '';
        if (href.startsWith('/')) href = 'https://shopee.vn' + href;

        if (imgUrl && href) {
          const encUrl = encodeURIComponent(href);
          const b64 = btoa(unescape(encodeURIComponent(`https://s.shopee.vn/an_redir?origin_link=${encUrl}&affiliate_id=${affId}`)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const affShortUrl = `https://shop.saigoncacanh.com/r.php?u=${b64}`;

          // Categorize
          let cat = 'phu-kien';
          let catName = 'Phụ Kiện Bể Cá';
          const cleanT = title.toLowerCase();
          if (cleanT.includes('thức ăn') || cleanT.includes('cám') || cleanT.includes('mồi')) { cat = 'thuc-an'; catName = 'Thức Ăn & Dinh Dưỡng'; }
          else if (cleanT.includes('bơm') || cleanT.includes('lọc') || cleanT.includes('sứ')) { cat = 'bom-loc'; catName = 'Bơm & Thiết Bị Lọc'; }
          else if (cleanT.includes('đèn') || cleanT.includes('led')) { cat = 'den-led'; catName = 'Đèn LED & Thủy Sinh'; }
          else if (cleanT.includes('vi sinh') || cleanT.includes('men') || cleanT.includes('thuốc')) { cat = 'thuoc-men'; catName = 'Thuốc & Men Vi Sinh'; }

          products.push({
            id: `sp-${Date.now()}-${idx}`,
            title: title.trim(),
            category: cat,
            categoryName: catName,
            price: priceEl ? priceEl.textContent.trim() : 'Deal Ngon',
            originalPrice: 'Shopee Deal',
            discount: 'HOT',
            rating: '5.0',
            sold: 'Shopee Mall',
            image: imgUrl,
            shopeeUrl: affShortUrl,
            status: 'active'
          });
        }
      }
    });

    sendResponse({ success: true, count: products.length, products: products });
  }
});
