const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to page...');
  await page.goto('http://localhost:3000/Power-Abo/');
  await page.waitForTimeout(3000);
  
  console.log('Taking initial screenshot...');
  await page.screenshot({ path: 'test-screenshots/01-initial.png', fullPage: true });
  
  // Scroll down to find streaming section
  console.log('Scrolling down...');
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-screenshots/02-scrolled.png' });
  
  // Find and click Netflix
  console.log('Looking for Netflix...');
  const netflix = await page.locator('text=Netflix').first();
  if (await netflix.isVisible()) {
    console.log('Found Netflix, clicking...');
    await netflix.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/03-after-click.png' });
    
    // Check if modal is visible
    const modal = await page.locator('.variant-modal');
    if (await modal.isVisible()) {
      console.log('SUCCESS: Modal is visible!');
      const box = await modal.boundingBox();
      console.log('Modal position:', box);
      
      // Check if centered (roughly)
      const viewport = page.viewportSize();
      const centerX = viewport.width / 2;
      const modalCenterX = box.x + box.width / 2;
      console.log('Viewport center:', centerX, 'Modal center:', modalCenterX);
      
      if (Math.abs(centerX - modalCenterX) < 100) {
        console.log('Modal appears to be horizontally centered!');
      }
    } else {
      console.log('ERROR: Modal not visible after clicking Netflix');
    }
  } else {
    console.log('Netflix card not found');
  }
  
  await browser.close();
  console.log('Done!');
})();
