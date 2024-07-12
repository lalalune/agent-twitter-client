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
PROXY_URL=           # HTTP(s) proxy for requests (optional)
```