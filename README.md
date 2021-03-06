# graphql-fragmental
GraphQL Fragment Resolver

Use it to maintain named GraphQL-fragments and resolve them into complex queries. 
Plays well with lightweight GraphQL-clients like [lokka](https://www.npmjs.com/package/lokka).

## Installation

`npm install graphql-fragmental`

## Usage

Example

```js

const { registerFragment, resolveQuery } = require('graphql-fragmental');
const lokka = require('lokka');

registerFragment('MyFragment', `
        description
        { 
            url
            id
            type
            subType
         }
    `);

const query = resolveQuery(`query tests { ...MyFragment }`);

lokka.query(query).then(response => console.log(response));

```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/finaldream/fragmental/tags). 

## Authors

* **Oliver Erdmann** - [olivererdmann](https://github.com/olivererdmann)
* **Finaldream Productions** - Organization [finaldream](https://github.com/finaldream)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
