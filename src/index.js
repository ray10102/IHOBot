require('console.lol');

const Twit = require('twit');
const config = require('./config');
const bot = new Twit(config.twitterKeys);

const findAndRetweet = require('./actions/find-and-retweet');
const startStream = require('./actions/stream');

console.rofl('Bot starting...');

const {WOEIDs} = config.twitterConfig.trendData;

const run = () => {
    bot.get("trends/place", {id: WOEIDs[Math.floor(Math.random() * WOEIDs.length)]},
        (err, data) => {
            const {trends} = data[0];
            findAndRetweet(bot, {trends});
            startStream(bot, {trends});
        }
    );
}

run();
setInterval(() => {
    run();
}, 1000 * 60 * 60 * 3);

