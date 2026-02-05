import { chromium, devices } from 'playwright';
import fs from 'fs';

async function run() {
    // Emulate iPhone 12 Pro
    const browser = await chromium.launch();
    const context = await browser.newContext({
        ...devices['iPhone 12 Pro'],
        isMobile: true,
        hasTouch: true
    });
    
    // Bypass What's New modal
    await context.addInitScript(() => {
        localStorage.setItem('power_calculator_last_version', '2.3.0');
    });

    const page = await context.newPage();
    
    if (!fs.existsSync('mobile-screenshots')) {
        fs.mkdirSync('mobile-screenshots');
    }

    console.log("Navigating to mobile view...");
    await page.goto('http://localhost:3000/Power-Abo/');
    await page.waitForLoadState('networkidle');
    
    // Screenshot 1: Top of page
    await page.screenshot({ path: 'mobile-screenshots/01-top.png' });
    
    // Screenshot 2: Scrolled to streaming selector
    const streamingSection = page.locator('.streaming-selector');
    if (await streamingSection.isVisible()) {
        await streamingSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'mobile-screenshots/02-streaming.png' });
    }

    // Screenshot 3: Open Netflix modal
    const netflixBtn = page.locator('button[aria-label*="Netflix"]').first();
    if (await netflixBtn.isVisible()) {
        await netflixBtn.click();
        await page.waitForTimeout(1000); // Wait for animation
        await page.screenshot({ path: 'mobile-screenshots/03-modal.png' });
    }

    await browser.close();
    console.log("Mobile screenshots saved to 'mobile-screenshots/'");
}

run();
