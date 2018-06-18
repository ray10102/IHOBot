const config = require('../config');

// a generic query builder for Twitter queries (not all twitter api operators supported)
class QueryBuilder {
    constructor() {
        this.params = [];
    }

    to(user) {
        this.params.push(`to:${user}`);
        return this;
    };

    from(user) {
        this.params.push(`from:${user}`);
        return this;
    };

    mentioning(user) {
        this.params.push(`@${user}`);
        return this;
    };

    withHashtag(hashtag) {
        this.params.push(`#${hashtag}`);
        return this;
    };

    withExactPhrase(phrase) {
        this.params.push(`"${phrase}"`);
        return this;
    };

    about(topic) {
        this.params.push(topic);
        return this;
    }

    since(month, day, year) {
        this.params.push(`since:${year}-${month}-${day}`);
        return this;
    };

    until(month, day, year) {
        this.params.push(`until:${year}-${month}-${day}`);
        return this;
    };

    without(term) {
        this.params.push(`-${term}`);
        return this;
    };

    askingQuestion() {
        this.params.push("?");
        return this;
    };

    withSentiment(positive) {
        this.params.push(`${positive ? ":)" : ":("}`);
        return this;
    };

    // helper for "with*" convenience functions below
    withType(value, type) {
        this.params.push(`${value ? "" : "-"}filter:${type}`);
        return this;
    };

    withRetweets(value) {
        return this.withType(value, "retweet");
    };

    withImages(value) {
        this.withType(value, "twimg");
        return this.withType(value, "images");
    };

    withLinks(value) {
        return this.withType(value, "links");
    };

    build() {
        var result = this.params.reduce((query, currentParam) => {
            return `${query} ${currentParam}`;
        });
        this.reset();
        return encodeURI(result);
    };

    reset() {
        this.params = [];
        return this;
    };
}

const getQuery = (seed, trends, bot) => {
    console.log(seed);
    var getTweets = new QueryBuilder();
    if (Math.floor(seed * 100) % 2) {
        const { following } = config.twitterConfig;
        const from = following[Math.floor(seed * following.length)];
        getTweets.from(from);
        console.log(`tweets from: ${from}`);
    } else {
        const abt = trends[Math.floor(seed * trends.length)].name;
        getTweets.about(abt);
        console.log(`tweets about: ${abt}`);
    }
    return getTweets.build();
};

const getTweetUrl = (tweet) => {
    return `http://twitter.com/${tweet.user.id_str}/status/${tweet.id_str}`;
}

const getText = (tweet) => {
    return tweet.full_text === undefined ? tweet.text : tweet.full_text;
}

const isReply = tweet => {
    const RT = /^RT/i

    return (
        RT.test(tweet.text) ||
        tweet.is_quote_status ||
        tweet.retweeted_status ||
        tweet.in_reply_to_status_id ||
        tweet.in_reply_to_status_id_str ||
        tweet.in_reply_to_user_id ||
        tweet.in_reply_to_user_id_str ||
        tweet.in_reply_to_screen_name
    );
}

const TwitterUtils = {
    getQuery: getQuery,
    getTweetUrl: getTweetUrl,
    getText: getText,
    isReply: isReply
};

module.exports = TwitterUtils;