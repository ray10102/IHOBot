const Twit = require('twit');
const config = require('../config');
const params = config.twitterConfig;

const TwitterUtils = require('../utils/twitter-utils');
const IHOBUtils = require('../utils/ihob-utils');

const quoteRetweet = require('./quote-retweet');

const findAndRetweet = (bot, {since_id, seed, errorCount} = {}) => {
    if (errorCount === 10) {
        console.rofl("errored 10 times, aborting");
        return;
    }

    seed = seed || Math.random();
    const query = TwitterUtils.getQuery(seed);
    console.log(`searching since id ${since_id}`);
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
            if (data.statuses.length === 0 || since_id === data.statuses[0].id) {
                findAndRetweet(bot); // you're done, get a new search
                return;
            }
            
            if (err) {
                console.lol(`shit, ${err}`);
                findAndRetweet(bot, {errorCount: (errorCount === undefined ? 0 : errorCount + 1)}); // try again? 
            } else {
                console.lol(`Yay!! Got ${data.statuses.length} tweets!`)
                const formattedTweets = [];
                for (i = 0; i < data.statuses.length; i++) {
                    console.log(data.statuses[i].id);
                    if (IHOBUtils.shouldRetweet(data.statuses[i])) {
                        formattedTweets.push({
                            rt: IHOBUtils.format(data.statuses[i]),
                            source: data.statuses[i]
                        });
                    }
                }

                const requery = () => {
                    console.lol("searching again");
                    findAndRetweet(bot, {
                        since_id: data.statuses[0].id,
                        seed: seed
                    });
                };

                if (formattedTweets.length > 0) {
                    quoteRetweet(formattedTweets, bot, requery);
                } else {
                    requery();
                }
            }
        }
    );
};

module.exports = findAndRetweet;
