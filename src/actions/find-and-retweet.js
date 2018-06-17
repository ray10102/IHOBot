const Twit = require('twit');
const config = require('../config');
const params = config.twitterConfig;

const TwitterUtils = require('../utils/twitter-utils');
const IHOBUtils = require('../utils/ihob-utils');

const quoteRetweet = require('./quote-retweet');

const findAndRetweet = (bot) => {
    const query = TwitterUtils.getQuery();

    bot.get(
        'search/tweets',
        {
            q: query,
            lang: params.lang,
            tweet_mode: params.tweetMode,
            count: 100
        },
        (err, data, response) => {
            if (err) {
                console.lol(`shit, ${err}`);
            } else {
                console.lol(`Yay!! Got ${data.statuses.length} tweets!`)
                const formattedTweets = [];
                for (i = 0; i < data.statuses.length; i++) {
                    if (IHOBUtils.shouldRetweet(data.statuses[i])) {
                        formattedTweets.push(IHOBUtils.format(data.statuses[i]));
                    }
                }
/*
                if (!isReply(data.statuses[rando])) {
                    retweetId = data.statuses[rando].id_str;
                }
*/
                quoteRetweet(formattedTweets, bot);
            }
        }
    );
};

module.exports = findAndRetweet;
