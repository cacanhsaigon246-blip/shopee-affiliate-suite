const fs = require('fs');
const html = fs.readFileSync('scratch/response.html', 'utf8');

// Find all matches for susercontent.com or deoshopoee or other patterns
const matches = html.match(/[\w.-]+?\.susercontent\.com\/file\/[\w]+/g);
console.log('Matches:', matches ? matches.slice(0, 10) : 'None');

// Check if og:image exists in any form
const ogImage = html.match(/og:image/i);
console.log('og:image found:', !!ogImage);
