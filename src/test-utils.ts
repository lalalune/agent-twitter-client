import { HttpsProxyAgent } from 'https-proxy-agent';
import { Scraper } from './scraper';
import fs from 'fs';
import { CookieJar } from 'tough-cookie';

export interface ScraperTestOptions {
  /**
   * Force the scraper to use username/password to authenticate instead of cookies. Only used
   * by this file for testing auth, but very unreliable. Should always use cookies to resume
   * session when possible.
   */
  authMethod: 'password' | 'cookies' | 'anonymous';
}

export async function getScraper(
  options: Partial<ScraperTestOptions> = { authMethod: 'cookies' },
) {
  const username = process.env['TWITTER_USERNAME'];
  const password = process.env['TWITTER_PASSWORD'];
  const email = process.env['TWITTER_EMAIL'];
  const twoFactorSecret = process.env['TWITTER_2FA_SECRET'];

  let cookiesArray: any = null;

  // try to read cookies by reading cookies.json with fs and parsing
  // check if cookies.json exists
  if (!fs.existsSync('./cookies.json')) {
    console.error(
      'cookies.json not found, using password auth - this is NOT recommended!',
    );
  } else {
    try {
      const cookiesText = fs.readFileSync('./cookies.json', 'utf8');
      cookiesArray = JSON.parse(cookiesText);
    } catch (e) {
      console.error('Error parsing cookies.json', e);
    }
  }

  const cookieStrings = cookiesArray?.map(
    (cookie: any) =>
      `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${
        cookie.path
      }; ${cookie.secure ? 'Secure' : ''}; ${
        cookie.httpOnly ? 'HttpOnly' : ''
      }; SameSite=${cookie.sameSite || 'Lax'}`,
  );

  const proxyUrl = process.env['PROXY_URL'];
  let agent: any;

  if (
    options.authMethod === 'cookies' &&
    (!cookieStrings || cookieStrings.length === 0)
  ) {
    console.warn(
      'TWITTER_COOKIES variable is not defined, reverting to password auth (not recommended)',
    );
    options.authMethod = 'password';
  }

  if (options.authMethod === 'password' && !(username && password)) {
    throw new Error(
      'TWITTER_USERNAME and TWITTER_PASSWORD variables must be defined.',
    );
  }

  if (proxyUrl) {
    agent = new HttpsProxyAgent(proxyUrl, {
      rejectUnauthorized: false,
    });
  }

  const scraper = new Scraper({
    transform: {
      request: (input, init) => {
        if (agent) {
          return [input, { ...init, agent }];
        }
        return [input, init];
      },
    },
  });

  if (options.authMethod === 'password') {
    await scraper.login(username!, password!, email, twoFactorSecret);
  } else if (options.authMethod === 'cookies') {
    await scraper.setCookies(cookieStrings);
  }

  return scraper;
}
