require('console.lol');

// tweets : an array of strings representing the text of the tweets to be tweeted
const quoteRetweet = (tweets, bot) => {
    if (tweets.length > 0) {
        bot.post('statuses/update',
            {status: tweets[tweets.length - 1]},
            (err, data) => {
                if (err) {
                    console.lol(`shit, ${err}`);
                    tweets.length = tweets.length - 1;
                    quoteRetweet(tweets, bot);
                } else {
                    console.rofl("Nice!!!");
                }
            }
        );
    } else {
        console.lol("yikes, no tweets retweeted");
    }
};

module.exports = quoteRetweet;
