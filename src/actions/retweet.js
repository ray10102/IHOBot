const IHOBUtils = require('../utils/ihob-utils');
const TwitterUtils = require('../utils/twitter-utils');
const quoteRetweet = require('./quote-retweet');

getRetweetHandler = (bot) => {
    return (tweet) => {
        retweet(tweet, bot);
    }
}

const retweet = (tweet, bot) => {
    if (IHOBUtils.shouldRetweet(tweet) && !TwitterUtils.isReply(tweet)) {
        const text = IHOBUtils.format(tweet);
        quoteRetweet([text], bot);
    }
}

module.exports = getRetweetHandler;