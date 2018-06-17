const IHOBUtils = require('../utils/ihob-utils');
const TwitterUtils = require('../utils/twitter-utils');
const quoteRetweet = require('./quote-retweet');

getRetweetHandler = (bot) => {
    return (tweet) => {
        retweet(tweet, bot);
    }
}

// Attempts to format and quote retweet a single tweet
const retweet = (tweet, bot) => {
    if (IHOBUtils.shouldRetweet(tweet) && !TwitterUtils.isReply(tweet)) {
        const text = IHOBUtils.format(tweet, {prefixMentions: true, reply: true});
        quoteRetweet([{rt: text, source: tweet}], bot);
    }
}

module.exports = getRetweetHandler;