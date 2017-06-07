/**
 * GraphQL Fragment Resolver.
 *
 * @author Oliver Erdmann, <o.erdmann@finaldream.de>
 * @since 23.05.2016
 */

const { uniq, difference } = require('lodash');
const Fragment = require('./Fragment');

/**
 * Manages GraphQL fragments for components.
 */
class FragmentStore {

    /**
     * Constructor.
     */
    constructor() {

        this.fragments = new Map();

        this.registerFragment = this.registerFragment.bind(this);
        this.resolveQuery = this.resolveQuery.bind(this);

    }

    /**
     * Registers and makes a fragment available.
     *
     * @param {string} name    Name of the fragment. This is used to resolve spread-references (e.g. "...Name").
     * @param {string} content GraphQL-Content. Either with "fragment on"-statement or without (expanded inline).
     */
    registerFragment(name, content) {

        this.fragments.set(name, new Fragment(name, content));

    }

    /**
     * Checks if a fragment name exists.
     *
     * @param {string} name Name of fragment.
     *
     * @returns {boolean} Existance.
     */
    hasFragment(name) {

        return this.fragments.has(name);

    }

    /**
     * Returns the content of a named fragment.
     *
     * @param {string} name Name of Fragment.
     *
     * @returns {string} Content of fragment.
     */
    getFragmentContent(name) {

        const fragment = this.getFragment(name);

        if (!fragment) {
            return null;
        }

        return fragment.content;

    }

    /**
     * Returns the fragment-instance.
     *
     * @param {string} name Name of fragment.
     *
     * @returns {Fragment} Instance of fragment.
     */
    getFragment(name) {

        if (!this.hasFragment(name)) {
            return null;
        }

        return this.fragments.get(name);

    }


    /**
     * Returns the named dependencies for a fragment. Allows basic filtering.
     *
     * @param {string} name Name of fragment.
     * @param {boolean|string[]} ignore Array of names to ignore, false to return all.
     *
     * @returns {string[]|null} Array of fragment-names of null, if none.
     */
    getDependenciesForFragment(name, ignore = false) {

        if (!this.hasFragment(name)) {
            return null;
        }

        let result;

        const fragment = this.getFragment(name);

        if (ignore && Array.isArray(ignore)) {
            result = difference(fragment.dependencies, ignore);
        } else {
            result = fragment.dependencies;
        }

        if (!result || !result.length) {
            return null;
        }

        return result;

    }

    /**
     * Returns fragments for all given names.
     *
     * @param {string[]|boolean} names Fragment.name to match, false for all names.
     * @param {string|boolean}   type Fragment.type to match, false for any type.
     *
     * @returns {Map} Map of fragments.
     */
    findFragments(names, type = false) {

        const result = new Map;

        if (typeof names === 'string') {
            names = [names];
        } else if (Array.isArray(names)) {
            names = uniq(names);
        }

        this.fragments.forEach((fragment, name) => {

            // Skip, if names specified and if not on list.
            if (names !== false && names.indexOf(name) === -1) {
                return;
            }

            // Skip, if type is defined and type does not match.
            if (type !== false && type !== fragment.type) {
                return;
            }

            result.set(name, fragment);

        });

        return result;

    }


    /**
     * Returns fragments for all given names.
     *
     * @param {string[]|boolean} names Fragment.name to match, false for all names.
     * @param {string|boolean}   type Fragment.type to match, false for any type.
     *
     * @returns {string[]} Array of fragments.
     */
    getFragments(names, type = false) {

        const result = [];
        const fragments = this.findFragments(names, type);

        fragments.forEach(fragment => result.push(fragment.content));

        return result;

    }


    /**
     * Gets the dependency-names for the provided names, including the provided names themselves.
     * Dependencies are resolved recursively, so every new dependency may add new names.
     *
     * @param {string[]} names Names to resolve
     * @param {string|string[]|boolean} types Include only types. false includes them all.
     *
     * @returns {string[]} Unique array of resolved names.
     */
    getDependencyTree(names, types = false) {

        const result = [];

        /**
         * Recursive dependency-walker
         *
         * @param {string} name Input
         */
        const addDependencies = (name) => {

            if (result.indexOf(name) === -1) {

                if (!this.hasFragment(name)) {
                    throw new Error(`Found reference to unknown fragment "${name}".`);
                }

                const fragment = this.getFragment(name);

                // Skip if types is set and not matching.
                if (types !== false && !fragment.isType(types)) {
                    return;
                }

                result.push(name);
            }

            const deps = this.getDependenciesForFragment(name, result);

            if (!deps || !deps.length) {
                return;
            }

            for (const dep of deps) {

                addDependencies(dep);

            }

        };

        for (const name of names) {

            addDependencies(name);

        }

        return uniq(result);

    }

    /**
     * Resolves inline-fragments only by injecting them where referenced.
     * References are replaced iteratively and as long new inline-references are found.
     *
     * @param {String} queryString The query-string to expand.
     *
     * @returns {string} the expanded query-string.
     */
    resolveInlineFragments(queryString) {

        const inlineFragments = this.findFragments(false, 'inline');

        let query = queryString;

        function replaceFragments() {

            let foundSome = false;

            inlineFragments.forEach((fragment, name) => {
                const pattern = new RegExp(`([\\s\\W])(\\.\\.\\.${name})([\\s\\W])`, 'g');

                if (query.match(pattern) === null) {
                    return;
                }

                foundSome = true;

                query = query.replace(pattern, "$1"+fragment.content+"$3");

            });

            return foundSome;

        }

        let found = false;
        do {
            found = replaceFragments();
        } while(found === true);

        return query;

    }

    /**
     * Resolves and expandes all dependencies of root-query.
     * All spread-references existing in a query, will be expanded or added, so that the query can be run.
     *
     * @param {string} query Initial query-statement.
     * @returns {string} Fully expanded query-statement.
     */
    resolveQuery(query) {

        const fragment = new Fragment('query', query);
        let dependencies = fragment.dependencies;
        let result = [query];

        if (!dependencies || !dependencies.length) {
            return query;
        }

        dependencies = this.getDependencyTree(dependencies, 'fragment');

        result = result.concat(this.getFragments(dependencies));
        result = result.join('\n');
        result = this.resolveInlineFragments(result);

        return result;

    }

}

/**
 * Global singleton.
 * @type {FragmentStore}
 */
module.exports = FragmentStore;
