/**
 * GraphQL Fragment for Loco
 *
 * @author Oliver Erdmann, <o.erdmann@finaldream.de>
 * @since 23.05.2016
 */

const { uniq } = require('lodash');

const REGEX_SPREAD = /\.\.\.(\w+)/g;
const REGEX_FRAGMENT = /\w*fragment[\w\s]+on/;
const REGEX_QUERY = /\w*query[\w\s]+\{/;

/**
 * Single instance of a GraphQL-fragment.
 */
class Fragment {

    /**
     * Constructor.
     *
     * @param {string} name    Name for a fragment.
     * @param {string} content Content for the fragment.
     */
    constructor(name, content) {

        this.name = name;
        this.content = content;
        this.isInline = REGEX_FRAGMENT.test(this.content) === false;
        this.dependencies = this.resolveDependencies(this.content);
        this.type = this.getType();

    }

    /**
     * Returns the fragment-type by analysing the content.
     *
     * @returns {string} fragment|query|inline
     */
    getType() {

        if (REGEX_FRAGMENT.test(this.content) === true) {
            return 'fragment';
        }

        if (REGEX_QUERY.test(this.content) === true) {
            return 'query';
        }

        return 'inline';

    }

    /**
     * Checks type against provided values.
     *
     * @param {string|string[]} types Type(s) to compare.
     *
     * @return {Boolean} Whether ot not types match.
     */
    isType(types) {

        if (!Array.isArray(types)) {
            return types === this.type;
        }

        return types.indexOf(this.type) !== -1;

    }

    /**
     * parses a fragment and extracts it's spread dependencies (...FRAGMENT)
     *
     * @param {string} fragment Fragment to parse
     *
     * @returns {array} Array of dependencies
     */
    resolveDependencies(fragment) {

        const matches = [];
        let match;

        while ((match = REGEX_SPREAD.exec(fragment)) !== null) {

            if (match && match.length > 1) {
                matches.push(match[1]);
            }

        }

        return uniq(matches);

    }

}

module.exports = Fragment;
