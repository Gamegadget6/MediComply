'use server';

import * as cheerio from 'cheerio';

export type ScanResult = {
  hasCookieBanner: boolean;
  hasPrivacyPolicy: boolean;
};

export async function scanUrl(url: string): Promise<ScanResult> {
  try {
    // 1. Validate URL
    if (!url.startsWith('http')) {
      return { hasCookieBanner: false, hasPrivacyPolicy: false };
    }

    // 2. Fetch the HTML (Lightweight & Fast)
    // We pretend to be a real browser so sites don't block us
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 } // Ensure we don't serve cached stale results
    });

    if (!response.ok) {
      return { hasCookieBanner: false, hasPrivacyPolicy: false };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const bodyText = $('body').text().toLowerCase();
    const lowerHtml = html.toLowerCase();

    // 3. Check for Cookie Banner (Heuristics)
    // We look for common keywords in the code or visible text
    const hasCookieBanner =
      lowerHtml.includes('cookie') && (
        lowerHtml.includes('consent') ||
        lowerHtml.includes('banner') ||
        lowerHtml.includes('gdpr') ||
        bodyText.includes('we use cookies') ||
        bodyText.includes('accept cookies')
      );

    // 4. Check for Privacy Policy
    // We specifically look for Links (<a> tags) that mention privacy
    const hasPrivacyPolicy = $('a').toArray().some((element) => {
      const text = $(element).text().toLowerCase().trim();
      const href = $(element).attr('href')?.toLowerCase() || '';

      return text.includes('privacy policy') ||
        text.includes('privacy statement') ||
        (text === 'privacy' && href.includes('privacy'));
    });

    return { hasCookieBanner, hasPrivacyPolicy };

  } catch (error) {
    console.error('Scan Error:', error);
    return { hasCookieBanner: false, hasPrivacyPolicy: false };
  }
}