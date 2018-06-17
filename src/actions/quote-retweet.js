require('console.lol');
const IHOBUtils = require('../utils/ihob-utils');

const retweetDelay = {
    initial: 5000,
    recurring: 2000
}
const tweetTooLong_ErrorMessage = "Tweet needs to be a bit shorter.";

// Attempts to format and quote retweet a single tweet from the list of potential tweets
// tweets : an array of strings representing the text of the tweets to be tweeted
const quoteRetweet = (tweets, bot, {onFail} = {}) => {
    if (tweets.length > 0) {
        const tweet = tweets[tweets.length - 1];
        if (tweet === undefined) {
            console.log(tweets);
            onFail && onFail();
            return;
        }
        console.log(`tweeting: ${tweet.rt}`);
        bot.post('statuses/update',
            {
                status: tweet.rt,
                in_reply_to_status_id: tweet.source && tweet.source.id
            },
            (err, data) => {
                if (err) {
                    console.lol(`shit, ${err}`);
                    // if too many characters, remove prefix elements and try again
                    if (err.message === tweetTooLong_ErrorMessage) {
                        reformatAndRT(tweet.source, bot);
                    }
                    tweets.length = tweets.length - 1;
                    quoteRetweet(tweets, bot, {onFail});
                } else {
                    handleReplySuccess(data.id_str, bot);
                    return;
                }
            }
        );
    } else {
        console.lol("yikes, no tweets retweeted");
        !onFail && console.log("no fail handler found");
        onFail && onFail();
    }
};

const reformatAndRT = (tweet, bot) => {
    reformatAndRTHelper(tweet, bot,
        { prefixMentions: false, reply: true },
        {
            onSuccess: (data) => {
                console.rofl("Successful RT without prefix mentions!");
                handleReplySuccess(data.id_str, bot);
            },
            onFail: () => {
                reformatAndRTHelper(tweet, bot,
                    {prefixMentions: false, reply: false},
                    {
                        onSuccess: () => {
                            console.rofl("Successful RT without reply or prefix mentions!");
                        },
                        onFail: (err, formattedTweet) => {
                            console.lol(`Reformatting long tweet failed :( ${err}\ntweet: ${formattedTweet}`);
                        }
                    }
                );
            }
        }
    ); 
}

const reformatAndRTHelper = (tweet, bot, { prefixMentions, reply } = {}, {onSuccess, onFail}) => {
    const text = IHOBUtils.format(tweet, {prefixMentions, reply});
    bot.post('statuses/update',
        {
            status: text,
            in_reply_to_status_id: reply && tweet.source && tweet.source.id
        },
        (err, data) => {
            if (err) {
                if (err.message === "Status is a duplicate.") {
                    return;
                }
                onFail && onFail(err, text);
            } else {
                onSuccess && onSuccess(data);
            }
        }
    );
};

const handleReplySuccess = (id, bot) => {
    console.rofl("Successful reply!!");
    setTimeout(() => {
        retweetReply(id, bot);
    }, retweetDelay.initial);
}

const retweetReply = (id, bot, errorCount) => {
    if (errorCount >= 5) {
        console.log(`Aborting retweeting reply ${id}`)
    }
    bot.post('statuses/retweet/:id',
        {id: id},
        (err, data) => {
            if (err) {
                console.lol(`oops, failed to RT the reply, ${id}, ${err}`);
                setTimeout(() => {
                    retweetReply(id, bot, (errorCount === undefined) ? 0 : errorCount + 1);
                }, retweetDelay.recurring);
            } else {
                console.lol("Woohoo! Successfully RT'd the reply!")
            }
        }
    )
}


module.exports = quoteRetweet;
