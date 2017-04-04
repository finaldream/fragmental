/**
 * GraphQL FragmentStore Test.
 *
 * @author Oliver Erdmann, <o.erdmann@finaldream.de>
 * @since 23.05.2016
 */

'use strict';

const assert = require('assert');
const store = require('../index').store;
const fixtures = require('./fixtures/FragmentTestMocks');

describe('FragmentStore', function () {

    store.registerFragment('Test1', fixtures.Test1);
    store.registerFragment('Test2', fixtures.Test2);
    store.registerFragment('Test3', fixtures.Test3);
    store.registerFragment('Test4', fixtures.Test4);
    store.registerFragment('Inline1', fixtures.Inline1);
    store.registerFragment('Inline2', fixtures.Inline2);
    store.registerFragment('Inline3', fixtures.Inline3);
    store.registerFragment('Query', fixtures.Query);
    store.registerFragment('InlineQuery', fixtures.InlineQuery);


    describe('#getFragmentContent()', function () {


        it('should contain registered fragments', function () {

            assert.equal(store.getFragmentContent('Test1'), fixtures.Test1);
            assert.equal(store.getFragmentContent('Test2'), fixtures.Test2);
            assert.equal(store.getFragmentContent('Test3'), fixtures.Test3);

        });

    });

    describe('#getDepencenciesForFragment()', function () {

        it('should find the correct dependencies', function () {

            assert.deepEqual(store.getDependenciesForFragment('Test1'), ['Test2']);
            assert.deepEqual(store.getDependenciesForFragment('Test2'), ['Test4', 'Test3']);
            assert.equal(store.getDependenciesForFragment('Test3'), null);

        });

        it('should ignore dependencies, if specified', function () {

            assert.deepEqual(store.getDependenciesForFragment('Test1', ['Test2']), null);
            assert.deepEqual(store.getDependenciesForFragment('Test2', ['Test4']), ['Test3']);
            assert.deepEqual(store.getDependenciesForFragment('Test2', ['Test5']), ['Test4', 'Test3']);
            assert.equal(store.getDependenciesForFragment('Test3', ['Test2']), null);

        });

    });

    describe('#hasFragment()', function () {

        it('should return correct boolean if it has a fragment', function () {

            assert.equal(store.hasFragment('Test1'), true);
            assert.equal(store.hasFragment('Test2'), true);
            assert.equal(store.hasFragment('Test5'), false);

        });

    });


    describe('#getFragments()', function () {

        it('should return content for multiple fragments', function () {

            assert.deepEqual(store.getFragments(['Test1']), [fixtures.Test1]);
            assert.deepEqual(store.getFragments(['Test1', 'Test2']), [fixtures.Test1, fixtures.Test2]);
            assert.deepEqual(store.getFragments(
                ['Test1', 'Test2', 'Test3']),
                [fixtures.Test1, fixtures.Test2, fixtures.Test3]
            );
            assert.deepEqual(store.getFragments([]), []);

        });
    });

    describe('#findFragments()', function () {
        it('should return only fragments of a certain type', function () {

            const inline = store.findFragments(false, 'inline');
            const fragment = store.findFragments(false, 'fragment');
            const query = store.findFragments(false, 'query');

            assert.ok(inline.has('Inline1'), true);
            assert.ok(fragment.has('Test1'), true);
            assert.ok(fragment.has('Test2'), true);
            assert.ok(fragment.has('Test3'), true);
            assert.ok(fragment.has('Test4'), true);
            assert.ok(query.has('Query'), true);

        });

    });

    describe('#getDependencyTree()', function () {

        it('should return the names of the input-fragments', function () {

            var results = store.getDependencyTree(['Test1']);
            assert.ok(results.indexOf('Test1') !== -1);

            results = store.getDependencyTree(['Test1', 'Test2', 'Test3']);
            assert.ok(results.indexOf('Test1') !== -1);
            assert.ok(results.indexOf('Test2') !== -1);
            assert.ok(results.indexOf('Test3') !== -1);

        });

        it('should return nested dependencies', function () {

            var results = store.getDependencyTree(['Test1']);

            assert.ok(results.indexOf('Test1') !== -1);
            assert.ok(results.indexOf('Test2') !== -1);
            assert.ok(results.indexOf('Test3') !== -1);

        });

        it('should throw on unknown dependencies', function () {

            store.registerFragment('Test5', 'fragment Test5 on Any { ...Test6 }');

            assert.throws(() => {
                store.getDependencyTree(['Test5']);
            });

        });

    });

    describe('#resolveInlineFragments()', function () {

        it('should resolve inline functions', function () {

            /*
             * DOM'T CHANGE THOSE INDENTATIONS!
             */
            assert.equal(store.resolveInlineFragments(fixtures.Inline1), fixtures.Inline1);
            assert.equal(store.resolveInlineFragments(fixtures.Inline2), `
        count
        data { 
        url
        id
        type
        subType
     }
        extra { 
        description
        { 
        url
        id
        type
        subType
     }
     }
    `);

            assert.equal(store.resolveInlineFragments(fixtures.Inline3), `
        description
        { 
        url
        id
        type
        subType
     }
    `);

        });
    });

    describe('#resolveQuery()', function () {

        it('should build a GraphQL-query from named fragments', function () {

            var result = store.resolveQuery(fixtures.Query);

            // Test for sub-strings, because order of fragments can not be guaranteed
            // Queries must come first, though.
            assert.ok(result.indexOf(fixtures.Query) === 0, true);
            assert.ok(result.indexOf(fixtures.Test1) > fixtures.Query.length, true);
            assert.ok(result.indexOf(fixtures.Test2) > fixtures.Query.length, true);
            assert.ok(result.indexOf(fixtures.Test3) > fixtures.Query.length, true);
            assert.ok(result.indexOf(fixtures.Test4) > fixtures.Query.length, true);

        });


        it('should build a GraphQL-query from inline fragments', function () {

            var result = store.resolveQuery(fixtures.Query);

            // Test for sub-strings, because order can not be guaranteed
            assert.ok(result.indexOf(fixtures.Query) === 0, true);
            assert.ok(result.indexOf(fixtures.Test1) > fixtures.Query.length, true);
            assert.ok(result.indexOf(fixtures.Test2) > fixtures.Query.length, true);
            assert.ok(result.indexOf(fixtures.Test3) > fixtures.Query.length, true);
            assert.ok(result.indexOf(fixtures.Test4) > fixtures.Query.length, true);

        });

         it('should resolve inline queries', function () {

            /*
             * DOM'T CHANGE THOSE INDENTATIONS!
             */
            const result = store.resolveQuery(fixtures.InlineQuery);
            assert.equal(result, `
        query tests { 
        count
        data { 
        url
        id
        type
        subType
     }
        extra { 
        description
        { 
        url
        id
        type
        subType
     }
     }
     }
    `);

        });

    });


});
