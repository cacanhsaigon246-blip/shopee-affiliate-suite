document.addEventListener('DOMContentLoaded', async () => {
  const currentUrlInput = document.getElementById('current-url');
  const affIdInput = document.getElementById('aff-id');
  const sub1Input = document.getElementById('sub1');
  const sub2Input = document.getElementById('sub2');
  const btnConvert = document.getElementById('btn-convert');
  const resultBox = document.getElementById('result-box');
  const resShortLink = document.getElementById('res-short-link');

  // Load saved affiliate ID
  chrome.storage.local.get(['shopee_aff_id'], (result) => {
    if (result.shopee_aff_id && result.shopee_aff_id !== '14354840000') {
      affIdInput.value = result.shopee_aff_id;
    } else {
      affIdInput.value = '17384730538';
      chrome.storage.local.set({ shopee_aff_id: '17384730538' });
    }
  });

  // Query active tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    currentUrlInput.value = tab.url;
  }

  btnConvert.addEventListener('click', async () => {
    const rawUrl = currentUrlInput.value;
    const affId = affIdInput.value.trim() || '17384730538';

    chrome.storage.local.set({ shopee_aff_id: affId });

    if (!rawUrl || (!rawUrl.includes('shopee.vn') && !rawUrl.includes('shope.ee'))) {
      alert('Vui lòng mở trang sản phẩm Shopee trước khi chuyển đổi!');
      return;
    }

    btnConvert.textContent = 'Đang chuyển đổi...';
    btnConvert.disabled = true;

    const encodedOrigin = encodeURIComponent(rawUrl);
    const subIds = [sub1Input.value.trim(), sub2Input.value.trim()].filter(s => s.length > 0);
    const subIdStr = subIds.join('-');

    let fullLink = `https://s.shopee.vn/an_redir?origin_link=${encodedOrigin}&affiliate_id=${affId}`;
    if (subIdStr) {
      fullLink += `&sub_id=${subIdStr}`;
    }

    // Try shortening link with ulvis.net (No Ads, Instant Redirect!)
    let finalLink = fullLink;
    try {
      const resp = await fetch(`https://ulvis.net/api.php?url=${encodeURIComponent(fullLink)}`);
      if (resp.ok) {
        finalLink = (await resp.text()).trim();
      }
    } catch (e) {
      console.warn('Shortener error:', e);
    }

    resShortLink.value = finalLink;
    resultBox.classList.remove('hidden');

    // Auto copy to clipboard
    navigator.clipboard.writeText(finalLink);

    btnConvert.textContent = 'Chuyển Đổi & Copy Link';
    btnConvert.disabled = false;
  });

  // Sync Current Shopee Page to Storefront (1-Click Real Image Sync!)
  const btnSyncPage = document.getElementById('btn-sync-page');
  if (btnSyncPage) {
    btnSyncPage.addEventListener('click', async () => {
      if (!tab || !tab.id || !tab.url || !tab.url.includes('shopee.vn')) {
        alert('Vui lòng mở một trang sản phẩm hoặc trang tìm kiếm Shopee trước khi bấm đồng bộ!');
        return;
      }

      const affId = affIdInput.value.trim() || '17384730538';
      btnSyncPage.textContent = '⏳ Đang quét & đồng bộ...';
      btnSyncPage.disabled = true;

      // Function to send scraped data to Hostinger save-products.php
      async function sendDataToStorefront(products) {
        try {
          const fd = new FormData();
          fd.append('payload', JSON.stringify({ mode: 'append', products: products }));

          const saveRes = await fetch('https://shop.saigoncacanh.com/save-products.php?token=041188', {
            method: 'POST',
            body: fd
          });
          const saveJson = await saveRes.json();

          if (saveJson && saveJson.success) {
            alert(`🎉 ĐÃ ĐỒNG BỘ THÀNH CÔNG ${products.length} SẢN PHẨM VỚI 100% ẢNH THẬT LÊN SHOP.SAIGONCACANH.COM!`);
          } else {
            alert('Có lỗi khi lưu lên máy chủ: ' + (saveJson ? saveJson.error : 'Lỗi kết nối server'));
          }
        } catch (err) {
          alert('Lỗi kết nối tới shop.saigoncacanh.com: ' + err.message);
        } finally {
          btnSyncPage.textContent = '📸 Đồng Bộ Trang Này Vào Siêu Thị';
          btnSyncPage.disabled = false;
        }
      }

      // Try sending message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'scrape_shopee_page', affId }, async (response) => {
        if (chrome.runtime.lastError || !response) {
          console.warn('Content script not injected yet, injecting dynamically...', chrome.runtime.lastError);
          // Dynamically inject content.js if missing
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });

            // Retry message after injection
            chrome.tabs.sendMessage(tab.id, { action: 'scrape_shopee_page', affId }, async (retryRes) => {
              if (retryRes && retryRes.success && retryRes.products && retryRes.products.length > 0) {
                await sendDataToStorefront(retryRes.products);
              } else {
                alert('Không tìm thấy sản phẩm nào trên trang này. Hãy cuộn nhẹ trang Shopee để ảnh tải xong rồi bấm lại nhé anh!');
                btnSyncPage.textContent = '📸 Đồng Bộ Trang Này Vào Siêu Thị';
                btnSyncPage.disabled = false;
              }
            });
          } catch (e) {
            alert('Không thể quét trang Shopee. Hãy bấm F5 làm mới trang Shopee rồi bấm lại nhé anh!');
            btnSyncPage.textContent = '📸 Đồng Bộ Trang Này Vào Siêu Thị';
            btnSyncPage.disabled = false;
          }
        } else if (response && response.success && response.products && response.products.length > 0) {
          await sendDataToStorefront(response.products);
        } else {
          alert('Không tìm thấy sản phẩm nào trên trang này. Hãy cuộn nhẹ trang Shopee để ảnh tải xong rồi bấm lại nhé anh!');
          btnSyncPage.textContent = '📸 Đồng Bộ Trang Này Vào Siêu Thị';
          btnSyncPage.disabled = false;
        }
      });
    });
  }
});
