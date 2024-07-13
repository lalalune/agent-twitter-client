# agent-twitter-client

This is a modified version of [@the-convocation/twitter-scraper](https://github.com/the-convocation/twitter-scraper) with added functionality for sending tweets and retweets. This package does not require Twitter API to use, and will run in both the browser and server.

## Installation
```sh
npm install agent-twitter-client
```

### Setup
Configure environment variables for authentication.

```
TWITTER_USERNAME=    # Account username
TWITTER_PASSWORD=    # Account password
TWITTER_EMAIL=       # Account email
TWITTER_COOKIES=     # JSON-serialized array of cookies of an authenticated session
PROXY_URL=           # HTTP(s) proxy for requests (necessary for browsers)
```

#### Getting Twitter Cookies
It is important that you use Twitter cookies so that you don't send a new login request to twitter every time you want to do something.

In your application, you will probably want to have a check for cookies. If you don't have cookies, log in with user auth credentials. Then, cache the cookies for future use.
```ts
    const scraper = await getScraper({ authMethod: 'password' });

    scraper.getCookies().then((cookies) => {
      console.log(cookies);
      // Remove 'Cookies' and save the cookies as a JSON array
    });
```