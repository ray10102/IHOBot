const getRetweetHandler = require('./retweet');
const config = require('../config');

const startStream = (bot, {trends}) => {
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

                const tracking = [
                    ...config.twitterConfig.tracking,
                    ...trends
                ];

                tweetStream = bot.stream('statuses/filter', {
                    follow: following,
                    track: tracking
                });

                tweetStream.on('tweet', getRetweetHandler(bot));
            }
        }
    );
};

module.exports = startStream;