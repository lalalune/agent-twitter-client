import { getScraper } from './test-utils';
import { QueryTweetsResponse } from './timeline-v1';
import { Mention, Tweet } from './tweets';

test('scraper can get tweet', async () => {
  const expected: Tweet = {
    conversationId: '1585338303800578049',
    html: `We’re updating Twitter’s sounds to help make them pleasing to more people, including those with sensory sensitivities. Here’s more on how we did it:<br><a href=\"https://blog.twitter.com/en_us/topics/product/2022/designing-accessible-sounds-story-behind-our-new-chirps\">https://t.co/7FKWk7NzHM</a>`,
    id: '1585338303800578049',
    hashtags: [],
    mentions: [],
    name: 'A11y',
    permanentUrl: 'https://twitter.com/XA11y/status/1585338303800578049',
    photos: [],
    text: 'We’re updating Twitter’s sounds to help make them pleasing to more people, including those with sensory sensitivities. Here’s more on how we did it:\nhttps://t.co/7FKWk7NzHM',
    thread: [],
    timeParsed: new Date(Date.UTC(2022, 9, 26, 18, 31, 20, 0)),
    timestamp: 1666809080,
    urls: [
      'https://blog.twitter.com/en_us/topics/product/2022/designing-accessible-sounds-story-behind-our-new-chirps',
    ],
    userId: '1631299117',
    username: 'XA11y',
    videos: [],
    isQuoted: false,
    isReply: false,
    isRetweet: false,
    isPin: false,
    sensitiveContent: false,
  };

  const scraper = await getScraper();
  const actual = await scraper.getTweet('1585338303800578049');
  delete actual?.likes;
  delete actual?.replies;
  delete actual?.retweets;
  delete actual?.views;
  delete actual?.bookmarkCount;
  expect(actual).toEqual(expected);
});

test('scraper can get tweets without logging in', async () => {
  const scraper = await getScraper({ authMethod: 'anonymous' });

  let counter = 0;
  for await (const tweet of scraper.getTweets('elonmusk', 10)) {
    if (tweet) {
      counter++;
    }
  }

  expect(counter).toBeGreaterThanOrEqual(1);
});

test('scraper can get tweets from list', async () => {
  const scraper = await getScraper();

  let cursor: string | undefined = undefined;
  const maxTweets = 30;
  let nTweets = 0;
  while (nTweets < maxTweets) {
    const res: QueryTweetsResponse = await scraper.fetchListTweets(
      '1736495155002106192',
      maxTweets,
      cursor,
    );

    expect(res.next).toBeTruthy();

    nTweets += res.tweets.length;
    cursor = res.next;
  }
});

test('scraper can get first tweet matching query', async () => {
  const scraper = await getScraper();

  const timeline = scraper.getTweets('elonmusk');
  const latestQuote = await scraper.getTweetWhere(timeline, { isQuoted: true });

  expect(latestQuote?.isQuoted).toBeTruthy();
});

test('scraper can get all tweets matching query', async () => {
  const scraper = await getScraper();

  // Sample size of 20 should be enough without taking long.
  const timeline = scraper.getTweets('elonmusk', 20);
  const retweets = await scraper.getTweetsWhere(
    timeline,
    (tweet) => tweet.isRetweet === true,
  );

  expect(retweets).toBeTruthy();

  for (const tweet of retweets) {
    expect(tweet.isRetweet).toBe(true);
  }
}, 20000);

test('scraper can get latest tweet', async () => {
  const scraper = await getScraper();

  // OLD APPROACH (without retweet filtering)
  const tweets = scraper.getTweets('elonmusk', 1);
  const expected = (await tweets.next()).value;

  // NEW APPROACH
  const latest = (await scraper.getLatestTweet(
    'elonmusk',
    expected?.isRetweet || false,
  )) as Tweet;

  expect(latest?.permanentUrl).toEqual(expected?.permanentUrl);
}, 30000);

test('scraper can get user mentions in tweets', async () => {
  const expected: Mention[] = [
    {
      id: '7018222',
      username: 'davidmcraney',
      name: 'David McRaney',
    },
  ];

  const scraper = await getScraper();
  const tweet = await scraper.getTweet('1554522888904101890');
  expect(tweet?.mentions).toEqual(expected);
});

test('scraper can get tweet quotes without logging in', async () => {
  const expected: Tweet = {
    conversationId: '1237110546383724547',
    html: `The Easiest Problem Everyone Gets Wrong <br><br>[new video] --&gt; <a href=\"https://youtu.be/ytfCdqWhmdg\">https://t.co/YdaeDYmPAU</a> <br><a href=\"https://t.co/iKu4Xs6o2V\"><img src=\"https://pbs.twimg.com/media/ESsZa9AXgAIAYnF.jpg\"/></a>`,
    id: '1237110546383724547',
    hashtags: [],
    mentions: [],
    name: 'Vsauce2',
    permanentUrl: 'https://twitter.com/VsauceTwo/status/1237110546383724547',
    photos: [
      {
        id: '1237110473486729218',
        url: 'https://pbs.twimg.com/media/ESsZa9AXgAIAYnF.jpg',
        alt_text: undefined,
      },
    ],
    text: 'The Easiest Problem Everyone Gets Wrong \n\n[new video] --&gt; https://t.co/YdaeDYmPAU https://t.co/iKu4Xs6o2V',
    thread: [],
    timeParsed: new Date(Date.UTC(2020, 2, 9, 20, 18, 33, 0)),
    timestamp: 1583785113,
    urls: ['https://youtu.be/ytfCdqWhmdg'],
    userId: '978944851',
    username: 'VsauceTwo',
    videos: [],
    isQuoted: false,
    isReply: false,
    isRetweet: false,
    isPin: false,
    sensitiveContent: false,
  };

  const scraper = await getScraper({ authMethod: 'anonymous' });
  const quote = await scraper.getTweet('1237110897597976576');
  expect(quote?.isQuoted).toBeTruthy();
  delete quote?.quotedStatus?.likes;
  delete quote?.quotedStatus?.replies;
  delete quote?.quotedStatus?.retweets;
  delete quote?.quotedStatus?.views;
  delete quote?.quotedStatus?.bookmarkCount;
  expect(quote?.quotedStatus).toEqual(expected);
});

test('scraper can get tweet quotes and replies', async () => {
  const expected: Tweet = {
    conversationId: '1237110546383724547',
    html: `The Easiest Problem Everyone Gets Wrong <br><br>[new video] --&gt; <a href=\"https://youtu.be/ytfCdqWhmdg\">https://t.co/YdaeDYmPAU</a> <br><a href=\"https://t.co/iKu4Xs6o2V\"><img src=\"https://pbs.twimg.com/media/ESsZa9AXgAIAYnF.jpg\"/></a>`,
    id: '1237110546383724547',
    hashtags: [],
    mentions: [],
    name: 'Vsauce2',
    permanentUrl: 'https://twitter.com/VsauceTwo/status/1237110546383724547',
    photos: [
      {
        id: '1237110473486729218',
        url: 'https://pbs.twimg.com/media/ESsZa9AXgAIAYnF.jpg',
        alt_text: undefined,
      },
    ],
    text: 'The Easiest Problem Everyone Gets Wrong \n\n[new video] --&gt; https://t.co/YdaeDYmPAU https://t.co/iKu4Xs6o2V',
    thread: [],
    timeParsed: new Date(Date.UTC(2020, 2, 9, 20, 18, 33, 0)),
    timestamp: 1583785113,
    urls: ['https://youtu.be/ytfCdqWhmdg'],
    userId: '978944851',
    username: 'VsauceTwo',
    videos: [],
    isQuoted: false,
    isReply: false,
    isRetweet: false,
    isPin: false,
    sensitiveContent: false,
  };

  const scraper = await getScraper();
  const quote = await scraper.getTweet('1237110897597976576');
  expect(quote?.isQuoted).toBeTruthy();
  delete quote?.quotedStatus?.likes;
  delete quote?.quotedStatus?.replies;
  delete quote?.quotedStatus?.retweets;
  delete quote?.quotedStatus?.views;
  delete quote?.quotedStatus?.bookmarkCount;
  expect(quote?.quotedStatus).toEqual(expected);

  const reply = await scraper.getTweet('1237111868445134850');
  expect(reply?.isReply).toBeTruthy();
  if (reply != null) {
    reply.isReply = false;
  }
  delete reply?.inReplyToStatus?.likes;
  delete reply?.inReplyToStatus?.replies;
  delete reply?.inReplyToStatus?.retweets;
  delete reply?.inReplyToStatus?.views;
  delete reply?.inReplyToStatus?.bookmarkCount;
  expect(reply?.inReplyToStatus).toEqual(expected);
});

test('scraper can get retweet', async () => {
  const expected: Tweet = {
    conversationId: '1776276954435481937',
    html: `<br><a href=\"https://t.co/qqiu5ntffp\"><img src=\"https://pbs.twimg.com/amplify_video_thumb/1776276900580622336/img/UknAtyWSZ286nCD3.jpg\"/></a>`,
    id: '1776276954435481937',
    hashtags: [],
    mentions: [],
    name: 'federico.',
    permanentUrl: 'https://twitter.com/federicosmos/status/1776276954435481937',
    photos: [],
    text: 'https://t.co/qqiu5ntffp',
    thread: [],
    timeParsed: new Date(Date.UTC(2024, 3, 5, 15, 53, 22, 0)),
    timestamp: 1712332402,
    urls: [],
    userId: '2376017065',
    username: 'federicosmos',
    videos: [
      {
        id: '1776276900580622336',
        preview:
          'https://pbs.twimg.com/amplify_video_thumb/1776276900580622336/img/UknAtyWSZ286nCD3.jpg',
        url: 'https://video.twimg.com/amplify_video/1776276900580622336/vid/avc1/640x360/uACt_egp_hmvPOZF.mp4?tag=14',
      },
    ],
    isQuoted: false,
    isReply: false,
    isRetweet: false,
    isPin: false,
    sensitiveContent: false,
  };

  const scraper = await getScraper();
  const retweet = await scraper.getTweet('1776285549566808397');
  expect(retweet?.isRetweet).toBeTruthy();
  delete retweet?.retweetedStatus?.likes;
  delete retweet?.retweetedStatus?.replies;
  delete retweet?.retweetedStatus?.retweets;
  delete retweet?.retweetedStatus?.views;
  delete retweet?.retweetedStatus?.bookmarkCount;
  expect(retweet?.retweetedStatus).toEqual(expected);
});

test('scraper can get tweet views', async () => {
  const expected: Tweet = {
    conversationId: '1606055187348688896',
    html: `Replies and likes don’t tell the whole story. We’re making it easier to tell *just* how many people have seen your Tweets with the addition of view counts, shown right next to likes. Now on iOS and Android, web coming soon.<br><br><a href=\"https://help.twitter.com/using-twitter/view-counts\">https://t.co/hrlMQyXJfx</a>`,
    id: '1606055187348688896',
    hashtags: [],
    mentions: [],
    name: 'Support',
    permanentUrl: 'https://twitter.com/Support/status/1606055187348688896',
    photos: [],
    text: 'Replies and likes don’t tell the whole story. We’re making it easier to tell *just* how many people have seen your Tweets with the addition of view counts, shown right next to likes. Now on iOS and Android, web coming soon.\n\nhttps://t.co/hrlMQyXJfx',
    thread: [],
    timeParsed: new Date(Date.UTC(2022, 11, 22, 22, 32, 50, 0)),
    timestamp: 1671748370,
    urls: ['https://help.twitter.com/using-twitter/view-counts'],
    userId: '17874544',
    username: 'Support',
    videos: [],
    isQuoted: false,
    isReply: false,
    isRetweet: false,
    isPin: false,
    sensitiveContent: false,
  };

  const scraper = await getScraper();
  const actual = await scraper.getTweet('1606055187348688896');
  expect(actual?.views).toBeTruthy();
  delete actual?.likes;
  delete actual?.replies;
  delete actual?.retweets;
  delete actual?.views;
  delete actual?.bookmarkCount;
  expect(actual).toEqual(expected);
});

test('scraper can get tweet thread', async () => {
  const scraper = await getScraper();
  const tweet = await scraper.getTweet('1665602315745673217');
  expect(tweet).not.toBeNull();
  expect(tweet?.isSelfThread).toBeTruthy();
  expect(tweet?.thread.length).toStrictEqual(7);
});

test('scraper can get user tweets', async () => {
  const scraper = await getScraper();

  const userId = '1830340867737178112'; // Replace with a valid user ID
  const maxTweets = 200;

  const response = await scraper.getUserTweets(userId, maxTweets);

  expect(response.tweets).toBeDefined();
  expect(response.tweets.length).toBeLessThanOrEqual(maxTweets);

  // Check if each object in the tweets array is a valid Tweet object
  response.tweets.forEach((tweet) => {
    expect(tweet.id).toBeDefined();
    expect(tweet.text).toBeDefined();
  });

  expect(response.next).toBeDefined();
}, 30000);

test('sendTweet successfully sends a tweet', async () => {
  const scraper = await getScraper();
  const draftText = 'Core updated on ' + Date.now().toString();

  const result = await scraper.sendTweet(draftText);
  console.log('Send tweet result:', result);

  const replyResult = await scraper.sendTweet(
    'Ignore this',
    '1430277451452751874',
  );
  console.log('Send reply result:', replyResult);
});
