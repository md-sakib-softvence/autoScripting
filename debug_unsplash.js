const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Navigating to Unsplash...');
  await page.goto('https://unsplash.com', { waitUntil: 'networkidle2' });
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/home/sakib/Desktop/task/dynamicScriting/unsplash_debug.png', fullPage: false });
  
  console.log('Extracting image details...');
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).slice(0, 10).map(img => ({
      src: img.src,
      dataSrc: img.getAttribute('data-src'),
      srcset: img.srcset,
      className: img.className
    }));
  });
  console.log('Sample Images:', JSON.stringify(images, null, 2));
  
  await browser.close();
})();
