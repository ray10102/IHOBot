// a generic query builder for Twitter queries (not all twitter api operators supported)
class QueryBuilder {
    constructor(topic) {
        this.params = [];
        if (topic) {
            this.params.push(topic); 
        }
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

const getQuery = () => {
    var getTweets = new QueryBuilder("I");
    return getTweets.from("Lin_Manuel").build();
};

const TwitterUtils = {
    getQuery: getQuery
};

module.exports = TwitterUtils;