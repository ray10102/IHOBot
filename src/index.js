const {createServer} = require('http');

require('console.lol');

const Twit = require('twit');
const config = require('./config');
const bot = new Twit(config.twitterKeys);

const findAndRetweet = require('./actions/find-and-retweet');

console.rofl('Bot starting...');

findAndRetweet(bot);


// retweet on keywords
// setInterval(retweet, config.twitterConfig.retweet)

// reply to new follower

/* 
const userStream = bot.stream('user')
userStream.on('follow', reply)

// This will allow the bot to run on now.sh
const server = createServer((req, res) => {
    res.writeHead(302, {
        Location: `https://twitter.com/${config.twitterConfig.username}`
    })
    res.end()
})

server.listen(3000)
*/