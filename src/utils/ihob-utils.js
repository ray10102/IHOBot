const prefixes = {
    i: "I: ",
    h: "H: ",
    o: "O: ",
    b: "B: "
}

// links in tweets are reformatted as t.co links, which have a max potential length of 20 characters that count toward character count.
const linkLength = 20;
const maxAcceptedLength = 280 - (prefixes.i.length + prefixes.o.length + prefixes.o.length + prefixes.b.length + linkLength);

const removePrefixMentions = (text) => {
    let prefix = "";
    while (text.charAt(0) === "@") {
        const i = text.indexOf(" ") + 1;
        prefix = `${prefix}${text.substring(0, i)}`;
        text = text.substring(i);
    }

    return {
        text: text,
        prefix: prefix
    };
};

const matchesIHOB = (text) => {
    const i = text.charAt(0).toLowerCase();
    if (i === "i" || i === "@") {
        if (i === "@") {
            text = removePrefixMentions(text).text;
        }
        const regex = /i.* h.* o.* b.*/i
        const matches = text.match(regex);
        return matches && matches[0] === text;
    }
    return false;
};

const shouldRetweet = (tweet) => {
    const text = tweet.full_text;
    return text.length <= maxAcceptedLength && matchesIHOB(text);
};

// helper for formatTweetText
const getSubstringTo = (text, letter) => {
    let index = text.indexOf(` ${letter}`);
    index = (index < 0) ? text.indexOf(` ${letter.toUpperCase()}`) : index;
    return {
        text: text.substring(0, index),
        rest: text.substring(index)
    }
}

const formatTweetText = (text) => {
    let prefix = null;
    if (text.charAt(0) === "@") {
        const splitText = removePrefixMentions(text);
        prefix = splitText.prefix;
        text = splitText.text;
    }
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
    const formattedText = formatTweetText(tweet.full_text);
    // quote retweet formatting belongs in twitter-utils, but trivial for now
    return `${formattedText} http://twitter.com/${tweet.user.id_str}/status/${tweet.id_str}`;
};

const IHOBUtils = {
    format: getRetweetText,
    shouldRetweet: shouldRetweet,
};

module.exports = IHOBUtils;