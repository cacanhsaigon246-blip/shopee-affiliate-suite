const fs = require('fs');

async function testOgImage(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    const html = await res.text();
    console.log('Final URL:', res.url);
    
    // Search og:image
    const mImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                 html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

    const mTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                   html.match(/<title>([^<]+)<\/title>/i);

    console.log('OG Image Found:', mImg ? mImg[1] : 'NONE');
    console.log('Title Found:', mTitle ? mTitle[1] : 'NONE');
  } catch (e) {
    console.error('Error:', e);
  }
}

testOgImage('https://s.shopee.vn/3qLup065na');
