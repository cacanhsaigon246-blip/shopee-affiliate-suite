async function testPdpApi(itemid, shopid) {
  try {
    const url = `https://shopee.vn/api/v4/pdp/get_pc?item_id=${itemid}&shop_id=${shopid}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Shopee-Language': 'vi',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const json = await res.json();
    console.log('PDP API Response:', JSON.stringify(json).substring(0, 500));
    if (json && json.data && json.data.item) {
      console.log('Item Name:', json.data.item.title || json.data.item.name);
      console.log('Image:', json.data.item.image || json.data.item.images[0]);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

testPdpApi(41604775261, 1545552307);
