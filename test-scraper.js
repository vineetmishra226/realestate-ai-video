const puppeteer = require('puppeteer');

async function scrapeGenericListing(url) {
    console.log("🚀 Launching Generic Scraper...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

        const rawData = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'))
                .map(img => img.src || img.dataset.src || img.dataset.lazy)
                .filter(src => src && src.startsWith('http'))
                .map(src =>
                    src
                        .replace('/thumb/', '/large/')
                        .replace('/small/', '/large/')
                        .replace('w=320', 'w=2000')
                        .replace('w=480', 'w=2000')
                );

            return {
                pageTitle: document.title,
                textLength: document.body.innerText.length,
                imageCount: images.length,
                images: [...new Set(images)].slice(0, 15)
            };
        });

        console.log("✅ Page Title:", rawData.pageTitle);
        console.log("🖼 Images found:", rawData.imageCount);
        console.log("📄 Text length:", rawData.textLength);
        console.log(rawData.images);

    } catch (err) {
        console.error("❌ Scraper error:", err.message);
    } finally {
        await browser.close();
    }
}

scrapeGenericListing(
  "https://www.barfoot.co.nz/property/residential/manukau-city/mangere-east/house/926321"
);
