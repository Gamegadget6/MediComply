'use server';

import puppeteer from 'puppeteer';

export type ScanResult = {
  hasCookieBanner: boolean;
  hasPrivacyPolicy: boolean;
};

export async function scanUrl(url: string): Promise<ScanResult> {
  const fallback: ScanResult = {
    hasCookieBanner: false,
    hasPrivacyPolicy: false,
  };

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return fallback;
    }

    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(10_000);

    await page.goto(parsedUrl.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 10_000,
    });

    const hasCookieBanner = await page.evaluate(() => {
      const cookieSelectors = [
        '[id*="cookie" i]',
        '[class*="cookie" i]',
        '[id*="consent" i]',
        '[class*="consent" i]',
        '[id*="gdpr" i]',
        '[class*="gdpr" i]',
      ];

      const selectorMatch = cookieSelectors.some((selector) =>
        document.querySelector(selector),
      );

      if (selectorMatch) return true;

      const bodyText = document.body?.innerText.toLowerCase() ?? '';
      return bodyText.includes('we use cookies');
    });

    const hasPrivacyPolicy = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).some((anchor) =>
        (anchor.textContent ?? '').toLowerCase().includes('privacy'),
      );
    });

    return { hasCookieBanner, hasPrivacyPolicy };
  } catch {
    return fallback;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
