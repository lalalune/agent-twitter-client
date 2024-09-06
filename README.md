# agent-twitter-client

This is a modified version of [@the-convocation/twitter-scraper](https://github.com/the-convocation/twitter-scraper) with added functionality for sending tweets and retweets. This package does not require Twitter API to use, and will run in both the browser and server.

## Installation
```sh
npm install agent-twitter-client
```

## Setup
Configure environment variables for authentication.

```
TWITTER_USERNAME=    # Account username
TWITTER_PASSWORD=    # Account password
TWITTER_EMAIL=       # Account email
PROXY_URL=           # HTTP(s) proxy for requests (necessary for browsers)
```

### Getting Twitter Cookies
It is important that you use Twitter cookies so that you don't send a new login request to twitter every time you want to do something.

In your application, you will probably want to have a check for cookies. If you don't have cookies, log in with user auth credentials. Then, cache the cookies for future use.
```ts
    const scraper = await getScraper({ authMethod: 'password' });

    scraper.getCookies().then((cookies) => {
      console.log(cookies);
      // Remove 'Cookies' and save the cookies as a JSON array
    });
```

## Getting Started
```ts
const scraper = new Scraper();
await scraper.login('username', 'password');
const tweets = await scraper.getTweets('elonmusk', 10);
const tweetsAndReplies = scraper.getTweetsAndReplies('elonmusk');
const latestTweet = await scraper.getLatestTweet('elonmusk');
const tweet = await scraper.getTweet('1234567890123456789');
await scraper.sendTweet('Hello world!');
```

## API

### Authentication
```ts
// Log in
await scraper.login('username', 'password');  

// Log out
await scraper.logout();

// Check if logged in
const isLoggedIn = await scraper.isLoggedIn();

// Get current session cookies
const cookies = await scraper.getCookies();

// Set current session cookies
await scraper.setCookies(cookies);

// Clear current cookies
await scraper.clearCookies();
```

### Profile
```ts
// Get a user's profile
const profile = await scraper.getProfile('TwitterDev');

// Get a user ID from their screen name 
const userId = await scraper.getUserIdByScreenName('TwitterDev');
```

### Search
```ts
import { SearchMode } from 'agent-twitter-client';

// Search for recent tweets
const tweets = scraper.searchTweets('#nodejs', 20, SearchMode.Latest);

// Search for profiles
const profiles = scraper.searchProfiles('John', 10); 

// Fetch a page of tweet results
const results = await scraper.fetchSearchTweets('#nodejs', 20, SearchMode.Top);

// Fetch a page of profile results
const profileResults = await scraper.fetchSearchProfiles('John', 10);
```

### Relationships
```ts
// Get a user's followers
const followers = scraper.getFollowers('12345', 100);

// Get who a user is following
const following = scraper.getFollowing('12345', 100);

// Fetch a page of a user's followers
const followerResults = await scraper.fetchProfileFollowers('12345', 100);

// Fetch a page of who a user is following 
const followingResults = await scraper.fetchProfileFollowing('12345', 100);
```

### Trends
```ts
// Get current trends
const trends = await scraper.getTrends();

// Fetch tweets from a list
const listTweets = await scraper.fetchListTweets('1234567890', 50);
```

### Tweets
```ts
// Get a user's tweets
const tweets = scraper.getTweets('TwitterDev');

// Get a user's liked tweets
const likedTweets = scraper.getLikedTweets('TwitterDev');

// Get a user's tweets and replies
const tweetsAndReplies = scraper.getTweetsAndReplies('TwitterDev');

// Get tweets matching specific criteria
const timeline = scraper.getTweets('TwitterDev', 100);
const retweets = await scraper.getTweetsWhere(
  timeline,
  (tweet) => tweet.isRetweet
);

// Get a user's latest tweet
const latestTweet = await scraper.getLatestTweet('TwitterDev');

// Get a specific tweet by ID
const tweet = await scraper.getTweet('1234567890123456789');
```