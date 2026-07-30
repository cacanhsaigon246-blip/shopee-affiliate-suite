// Listen to messages from external web dashboard pages (aff.saigoncacanh.com)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true, message: 'pong' });
  } else if (request.action === 'fetch_shopee_product') {
    const { itemid, shopid } = request;
    const apiUrl = `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`;

    fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json && json.data) {
          sendResponse({ success: true, data: json.data });
        } else {
          sendResponse({ success: false, error: 'Không tìm thấy dữ liệu sản phẩm' });
        }
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });

    return true; // Keep message channel open for async response
  } else if (request.action === 'resolve_redirect') {
    const { url } = request;
    
    // Follow redirect to get final URL containing shopid & itemid
    fetch(url, {
      method: 'GET',
      redirect: 'follow',
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
