async function run() {
  try {
    const url = 'https://shopee.vn/api/v4/item/get?itemid=41604775261&shopid=1545552307';
    console.log('Fetching:', url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://shopee.vn/',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response image hash:', data?.data?.image);
    console.log('Response name:', data?.data?.name);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
