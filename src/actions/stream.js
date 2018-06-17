const retweet = require('./actions/retweet');

const startStream = (bot) => {
    const following = [];
    let tweetStream;
    bot.get("users/lookup", // get user id's based on the list of twitter handles in config.js
        {screen_name: config.twitterConfig.following},
        (err, data, response) => {
            if (err) {
                console.lol(`shit, ${err}`);
            } else {
                data.forEach((user) => {
                    following.push(`${user.id_str}`);
                });

                tweetStream = bot.stream('statuses/filter', {
                    follow: following,
                    track: config.twitterConfig.tracking
                });

                tweetStream.on('tweet', retweet);
            }
        }
    );
};

module.exports = startStream;