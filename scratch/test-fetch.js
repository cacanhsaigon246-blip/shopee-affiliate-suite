const child_process = require('child_process');

function fetchMobileHtml(url) {
  return new Promise((resolve) => {
    const cmd = `curl.exe -s -L -A "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1" "${url}"`;
    child_process.exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) return resolve('');
      resolve(stdout);
    });
  });
}

async function testMobile() {
  const url = 'https://shopee.vn/product/1545552307/41604775261';
  console.log('Fetching Mobile HTML:', url);
  const html = await fetchMobileHtml(url);
  console.log('HTML length:', html.length);
  const ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);
  console.log('OG Image:', ogImg ? ogImg[1] : 'NOT FOUND');
  
  // Look for image hashes
  const hashes = html.match(/(?:vn|sg|id|th|ph|my|tw)-\d+-\w+-\w+-\w+/g);
  console.log('Found image hashes:', hashes ? [...new Set(hashes)].slice(0, 5) : 'NONE');
}

testMobile();
