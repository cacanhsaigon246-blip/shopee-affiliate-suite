// Service Worker for Shopee Affiliate Extension (Chrome Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Shopee Affiliate Extension installed & ready.');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Shopee Affiliate Extension service worker started.');
});

// Listen to messages from external web dashboard pages (aff.saigoncacanh.com)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true, message: 'pong' });
  } else if (request.action === 'fetch_shopee_product') {
    const { itemid, shopid } = request;
    const apiUrl = `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`;

    fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(res => res.json())
      .then(json => {
        const itemData = (json && json.data) ? json.data : (json && json.item ? json.item : null);
        if (itemData) {
          sendResponse({ success: true, data: itemData });
        } else {
          fetch(`https://shopee.vn/api/v2/item/get?itemid=${itemid}&shopid=${shopid}`, { credentials: 'include' })
            .then(r => r.json())
            .then(j2 => {
              const d2 = (j2 && j2.item) ? j2.item : (j2 && j2.data ? j2.data : null);
              if (d2) {
                sendResponse({ success: true, data: d2 });
              } else {
                sendResponse({ success: false, error: 'Không tìm thấy dữ liệu sản phẩm' });
              }
            })
            .catch(e2 => sendResponse({ success: false, error: e2.message }));
        }
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });

    return true;
  } else if (request.action === 'resolve_redirect') {
    const { url } = request;
    fetch(url, {
      method: 'GET',
      redirect: 'follow',
      credentials: 'include',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
      .then(res => {
        sendResponse({ success: true, finalUrl: res.url });
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});
