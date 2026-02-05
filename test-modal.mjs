import { chromium } from 'playwright';

const test = async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    // Capture console logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('Navigating to page...');
    await page.goto('http://localhost:3000/Power-Abo/');
    await page.waitForTimeout(4000);

    // Find Netflix card
    console.log('Looking for Netflix card...');
    const netflixCard = page.locator('button:has-text("Netflix")').first();

    if (await netflixCard.isVisible()) {
        console.log('Found Netflix card, scrolling into view...');
        await netflixCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        console.log('Clicking Netflix...');
        await netflixCard.click();
        await page.waitForTimeout(2000);

        // Take FULL PAGE screenshot to see the modal wherever it is
        await page.screenshot({ path: 'test-screenshots/05-fullpage-with-modal.png', fullPage: true });

        // Check for modal
        const modal = page.locator('.variant-modal');
        const backdrop = page.locator('.variant-modal-backdrop');

        const backdropVisible = await backdrop.isVisible();
        const modalVisible = await modal.isVisible();

        console.log('Backdrop visible:', backdropVisible);
        console.log('Modal visible:', modalVisible);

        if (modalVisible) {
            const box = await modal.boundingBox();
            console.log('Modal bounding box:', JSON.stringify(box));

            // Scroll to the modal to take a viewport screenshot
            await modal.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'test-screenshots/06-modal-in-view.png' });

            const viewport = page.viewportSize();
            console.log('Viewport:', JSON.stringify(viewport));

            // Check centering
            const centerX = viewport.width / 2;
            const modalCenterX = box.x + box.width / 2;
            console.log('Viewport centerX:', centerX);
            console.log('Modal centerX:', modalCenterX);
            console.log('Modal Y position:', box.y);

            if (Math.abs(centerX - modalCenterX) < 100) {
                console.log('✅ Modal is horizontally centered');
            } else {
                console.log('❌ Modal is NOT horizontally centered');
            }

            // Is modal in viewport? (Y should be between 0 and viewport.height - box.height)
            if (box.y >= 0 && box.y + box.height <= viewport.height + 50) {
                console.log('✅ Modal is within viewport vertically');
            } else {
                console.log('⚠️ Modal may extend beyond viewport. Y=' + box.y + ', Height=' + box.height + ', Viewport height=' + viewport.height);
            }
        } else {
            console.log('❌ Modal NOT visible');
        }
    } else {
        console.log('Netflix card button not found');
    }

    await page.waitForTimeout(3000);
    await browser.close();
    console.log('Test complete!');
};

test();
