const IHOBUtils = require('../utils/ihob-utils');
const quoteRetweet = require('./quote-retweet');

const retweet = (tweet, bot) => {
    if (IHOBUtils.shouldRetweet(tweet)) {
        const text = IHOBUtils.format(tweet);
        quoteRetweet([text], bot);
    }
}

module.exports = retweet;