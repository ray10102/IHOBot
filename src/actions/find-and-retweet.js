const Twit = require('twit');
const config = require('../config');
const params = config.twitterConfig;

const TwitterUtils = require('../utils/twitter-utils');
const IHOBUtils = require('../utils/ihob-utils');

const quoteRetweet = require('./quote-retweet');

const findAndRetweet = (bot, {trends, since_id, seed, errorCount} = {}) => {
    if (errorCount === 10) {
        console.rofl("errored 10 times, aborting");
        return;
    }

    seed = seed || Math.random();
    const query = TwitterUtils.getQuery(seed, trends, bot);
    console.log(`searching since id ${since_id || 1}`);
    bot.get(
        'search/tweets',
        {
            q: query,
            lang: params.lang,
            tweet_mode: params.tweetMode,
            count: 100,
            since_id: since_id || 1
        },
        (err, data, response) => {
            if (data.statuses === undefined) {
                console.log(data); // you've probably excceeded your rate limit
                return;
            }
            if (data.statuses.length === 0 || since_id === data.statuses[0].id) {
                findAndRetweet(bot, {trends}); // you're done, get a new search
                return;
            }
            
            if (err) {
                console.lol(`shit, ${err}`);
                findAndRetweet(bot, {trends, errorCount: (errorCount === undefined ? 0 : errorCount + 1)}); // try again? 
            } else {
                console.lol(`Yay!! Got ${data.statuses.length} tweets!`)
                const formattedTweets = [];
                data.statuses.forEach((tweet) => {
                    if (IHOBUtils.shouldRetweet(tweet)) {
                        formattedTweets.push({
                            rt: IHOBUtils.format(tweet, { prefixMentions: true, reply: true }),
                            source: tweet
                        });
                    }
                });

                const requery = () => {
                    console.lol("searching again");
                    findAndRetweet(bot, {
                        since_id: data.statuses[0].id,
                        seed,
                        trends
                    });
                };

                if (formattedTweets.length > 0) {
                    quoteRetweet(formattedTweets, bot, {
                        onFail: requery
                    });
                } else {
                    requery();
                }
            }
        }
    );
};

module.exports = findAndRetweet;
