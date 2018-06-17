require('console.lol');

const tweetTooLong_ErrorMessage = "Tweet needs to be a bit shorter.";
// tweets : an array of strings representing the text of the tweets to be tweeted
const quoteRetweet = (tweets, bot, onFail) => {
    if (tweets.length > 0) {
        const tweet = tweets[tweets.length - 1];
        if (tweet === undefined) {
            console.log(tweets);
            onFail && onFail();
            return;
        }
        console.log(`tweeting: ${tweet.rt}`)
        bot.post('statuses/update',
            {
                status: tweet.rt,
                in_reply_to_status_id: tweet.source.id
            },
            (err, data) => {
                if (err) {
                    console.lol(`shit, ${err}`);
                    if (err.message === tweetTooLong_ErrorMessage) {
                        const success = quoteRetweetWithoutReply(tweets[tweets.length - 1], bot);
                        if (success) {
                            console.rofl("Nice!!!");
                            return;
                        }
                    }
                    tweets.length = tweets.length - 1;
                    quoteRetweet(tweets, bot);
                } else {
                    // TODO, rt the result
                    console.rofl("Nice!!!");
                    return;
                }
            }
        );
    } else {
        console.lol("yikes, no tweets retweeted");
        onFail && onFail();
    }
};

const quoteRetweetWithoutReply = (tweet, bot) => {
    let text = tweet.rt;
    let regex = /@\w* /g; // remove the first match
    const result = regex.exec(text);
    if (result !== null && result.index === 0) { // a zero indexed match!
        text = text.substring(regex.lastIndex);
    } else {
        console.lol(`uhhhhh, something's actually wrong with this reply: ${tweet.rt}`);
        return false;
    }

    bot.post('statuses/update',
        {status: text},
        (err, data) => {
            if (err) {
                console.lol(`shit, again?? ${err}`);
                return false;
            }
            return true;
        }
    );
};


module.exports = quoteRetweet;
