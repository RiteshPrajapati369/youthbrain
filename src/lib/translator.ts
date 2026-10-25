/**
 * Translation service for YouTh Brain News
 * Supports automatic bidirectional translation between Nepali ('ne') and English ('en').
 * Uses high-speed primary translation with automatic fallback.
 */

export interface TranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

/**
 * Clean and unescape translated HTML entities
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/');
}

/**
 * Primary translation via Google Translate single gtx endpoint (via POST for unlimited length)
 */
async function translateWithGoogle(text: string, from: string, to: string): Promise<string> {
  const body = new URLSearchParams();
  body.append('q', text);

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Google Translate error: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0].map((item: any) => (item && item[0] ? item[0] : '')).join('');
    return decodeHtmlEntities(translated);
  }

  throw new Error('Unexpected translation response structure');
}

/**
 * Fallback translation via MyMemory API
 */
async function translateWithMyMemory(text: string, from: string, to: string): Promise<string> {
  // MyMemory works best on chunks under 500 characters
  const trimmed = text.length > 500 ? text.slice(0, 500) : text;
  const langpair = `${from}|${to}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(langpair)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory error: ${res.status}`);

  const data = await res.json();
  if (data?.responseData?.translatedText) {
    return decodeHtmlEntities(data.responseData.translatedText);
  }

  throw new Error('MyMemory translation empty');
}

/**
 * Translate text between Nepali and English with error handling and fallback
 */
export async function translateText(
  text: string,
  from: 'ne' | 'en',
  to: 'ne' | 'en'
): Promise<string> {
  if (!text || !text.trim()) {
    return '';
  }

  if (from === to) {
    return text;
  }

  try {
    return await translateWithGoogle(text, from, to);
  } catch (primaryErr) {
    console.warn('Primary translation service failed, trying fallback:', primaryErr);
    try {
      return await translateWithMyMemory(text, from, to);
    } catch (fallbackErr) {
      console.error('All translation services failed:', fallbackErr);
      throw new Error('Translation failed on all available providers.');
    }
  }
}
