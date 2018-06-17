require('console.lol');

const Twit = require('twit');
const config = require('./config');
const bot = new Twit(config.twitterKeys);

const findAndRetweet = require('./actions/find-and-retweet');
const startStream = require('./actions/stream');

console.rofl('Bot starting...');

findAndRetweet(bot);
startStream(bot);