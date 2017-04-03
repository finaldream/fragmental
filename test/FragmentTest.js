'use strict';

const assert = require('assert');
const Fragment = require('../src/Fragment');
const fixtures = require('./fixtures/FragmentTestMocks');

describe('Fragment', function () {

    const query = new Fragment('Query', fixtures.Query);
    const test1 = new Fragment('Test1', fixtures.Test1);
    const test2 = new Fragment('Test2', fixtures.Test2);
    const inline1 = new Fragment('Test1', fixtures.Inline1);

    describe('#constructor()', function () {


        it('should set the correct type', function () {

            assert.equal(test1.type, 'fragment');
            assert.equal(inline1.type, 'inline');
            assert.equal(query.type, 'query');

        });

    });

    describe('#resolveDependencies()', function () {

        it('should find all dependencies using spread-notation', function () {

            assert.deepEqual(test1.dependencies, ['Test2']);
            assert.deepEqual(test2.dependencies, ['Test4', 'Test3']);
            assert.deepEqual(inline1.dependencies, []);

        });

    });

    describe('#isType()', function () {

        it('should match a string', function () {

            assert.ok(query.isType('query'));
            assert.ok(!query.isType('fragment'));
            assert.ok(!query.isType('unknown'));

            assert.ok(test1.isType('fragment'));
            assert.ok(!test1.isType('inline'));
            assert.ok(!test1.isType('unknown'));

            assert.ok(inline1.isType('inline'));
            assert.ok(!inline1.isType('fragment'));
            assert.ok(!inline1.isType('unknown'));

        });


        it('should match an array', function () {

            assert.ok(query.isType(['query']));
            assert.ok(query.isType(['query', 'fragment']));
            assert.ok(!query.isType(['inline', 'fragment']));
            assert.ok(!query.isType([]));
            assert.ok(!query.isType(['unknown', 'lipsum']));

            assert.ok(test1.isType(['fragment']));
            assert.ok(test1.isType(['query', 'fragment']));
            assert.ok(!test1.isType(['inline', 'query']));
            assert.ok(!test1.isType([]));
            assert.ok(!test1.isType(['unknown', 'lipsum']));

            assert.ok(inline1.isType(['inline']));
            assert.ok(inline1.isType(['inline', 'fragment']));
            assert.ok(!inline1.isType(['query', 'fragment']));
            assert.ok(!inline1.isType([]));
            assert.ok(!inline1.isType(['unknown', 'lipsum']));

        });

    });


});
