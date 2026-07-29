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
    if (result.shopee_aff_id) {
      affIdInput.value = result.shopee_aff_id;
    }
  });

  // Query active tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    currentUrlInput.value = tab.url;
  }

  btnConvert.addEventListener('click', async () => {
    const rawUrl = currentUrlInput.value;
    const affId = affIdInput.value.trim() || '14354840000';

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

    // Try shortening link with TinyURL
    let finalLink = fullLink;
    try {
      const resp = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(fullLink)}`);
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
});
