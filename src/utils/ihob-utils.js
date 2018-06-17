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
    let prefix = null;
    let regex = /(?:@\w* )+/g;
    const result = regex.exec(text);
    if (result !== null && result.index === 0) { // a zero indexed match!
        text = text.substring(regex.lastIndex);
        prefix = result[0];
    }
    return {
        text: text,
        prefix: prefix
    }
};

const matchesIHOB = (text) => {
    const regex = /(?:@\w* )* ?#?i.* {1,2}#?h.* {1,2}#?o.* {1,2}#?b.*/i
    const result = regex.exec(text);
    return result !== null && result.index === 0;
};

const shouldRetweet = (tweet) => {
    let text = TwitterUtils.getText(tweet);
    return text.length <= maxAcceptedLength && matchesIHOB(text);
};

// helper for formatTweetText
const getSubstringTo = (text, letter) => {
    let regex = new RegExp(` {1,2}#?${letter}`);
    const result = regex.exec(text);
    return {
        text: text.substring(0, result.index),
        rest: text.substring(regex.lastIndex - ((result[0].indexOf("#") < 0) ? 1 : 2))
    }
}

const formatTweetText = (text) => {
    const splitText = removePrefixMentions(text);
    const prefix = splitText.prefix;
    text = splitText.text;
    const i = getSubstringTo(text, "h");
    const h = getSubstringTo(i.rest, "o");
    const o = getSubstringTo(h.rest, "b");
    const ihob = (
`${prefixes.i}${i.text}
${prefixes.h}${h.text}
${prefixes.o}${o.text}
${prefixes.b}${o.rest}`
    );
    return !prefix ? ihob : `${prefix}\n${ihob}`;
};

const getRetweetText = (tweet) => {
    const formattedText = formatTweetText(TwitterUtils.getText(tweet));
    // quote retweet formatting belongs in twitter-utils, but trivial for now
    return `${formattedText} ${TwitterUtils.getTweetUrl(tweet)}`;
};

const IHOBUtils = {
    format: getRetweetText,
    shouldRetweet: shouldRetweet,
};

module.exports = IHOBUtils;