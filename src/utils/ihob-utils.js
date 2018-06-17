const TwitterUtils = require('./twitter-utils');

const prefixes = {
    i: "I: ",
    h: "H: ",
    o: "O: ",
    b: "B: "
}

// links in tweets are reformatted as t.co links, which have a max potential length of 20 characters that count toward character count.
const linkLength = 20;
const maxAcceptedLength = 280 - (prefixes.i.length + prefixes.o.length + prefixes.o.length + prefixes.b.length + linkLength) + 3; // +3 for incidental removal of trailing spaces

const removePrefixMentions = (text) => {
    let prefix = "";
    let regex = /(?:@\w* )+/g;
    const result = regex.exec(text);
    if (result !== null && result.index === 0) { // a zero indexed match!
        text = text.substring(regex.lastIndex);
        prefix = result[0].trim(); // add leading space, remove trailing space
    }
    return {
        text: text,
        prefix: prefix
    }
};

const matchesIHOB = (text) => {
    const regex = /(?:@\w* )* ?#?i.* {1,2}#?h.* {1,2}#?o.* {1,2}#?b.*/i
    const result = regex.exec(text);
    return result !== null && result.index === 0 && !isBlacklistedPattern(text) ;
};

const isBlacklistedPattern = (text) => { // TODO: refactor this to take a list of blacklisted patterns from config.js
    const IHORegex = /(?:@\w* )* ?#?(?:ihob)|(?:international).* {1,2}#?house.* {1,2}#?of.* {1,2}#?b.*/i;
    const badResult = IHORegex.exec(text);
    const isYoutubeLike = text.indexOf("I liked a @YouTube video") >= 0;
    return badResult !== null && isYoutubeLike;
}

const shouldRetweet = (tweet) => {
    let text = TwitterUtils.getText(tweet);
    return text.length <= maxAcceptedLength && matchesIHOB(text);
};

// helper for formatTweetText
const getSubstringTo = (text, letter) => {
    let regex = new RegExp(` {1,2}#?${letter}`, "gi");
    const result = regex.exec(text);
    return {
        text: text.substring(0, result.index),
        rest: text.substring(regex.lastIndex - ((result[0].indexOf("#") < 0) ? 1 : 2))
    }
}

const formatPrefix = (tweet, prefix, {prefixMentions, reply} = {}) => {
    const {screen_name} = tweet.user;
    const replyTag = `@${screen_name}`;
    return `${reply ? replyTag : ""} ${prefixMentions ? prefix : ""}`.trim();
}

const formatTweetText = (tweet, {prefixMentions, reply} = {}) => {
    console.log(`formatting tweet:\n${tweet}`);
    const splitText = removePrefixMentions(TwitterUtils.getText(tweet));
    const prefix = formatPrefix(tweet, splitText.prefix, {prefixMentions, reply});
    const text = splitText.text;
    const i = getSubstringTo(text, "h");
    const h = getSubstringTo(i.rest, "o");
    const o = getSubstringTo(h.rest, "b");
    const body = (
`${prefixes.i}${i.text.trim()}
${prefixes.h}${h.text.trim()}
${prefixes.o}${o.text.trim()}
${prefixes.b}${o.rest.trim()}`
    );
    return (prefix === "") ? body : `${prefix}\n${body}`;
};

const getRetweetText = (tweet, {prefixMentions, reply} = {}) => {
    const formattedText = formatTweetText(tweet, {prefixMentions, reply});
    // quote retweet formatting belongs in twitter-utils, but trivial for now
    return `${formattedText} ${TwitterUtils.getTweetUrl(tweet)}`;
};

const IHOBUtils = {
    format: getRetweetText,
    shouldRetweet: shouldRetweet,
};

module.exports = IHOBUtils;