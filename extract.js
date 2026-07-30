const fs = require('fs');
const path = 'C:\\Users\\SAIGONCACANH\\Downloads\\Lấy link sản phẩm hàng loạt20260730195940-c9044f41c76c42fb9cb6a0634595bc63.csv';
const csvData = fs.readFileSync(path, 'utf8');
const links = csvData.match(/https:\/\/s\.shopee\.vn\/[^\s,\"]+/g);
if (links) {
    fs.writeFileSync('C:\\Users\\SAIGONCACANH\\Desktop\\100_Link_Shopee.txt', links.join('\n'));
    console.log('Extracted ' + links.length + ' links to Desktop!');
} else {
    console.log('No links found.');
}
