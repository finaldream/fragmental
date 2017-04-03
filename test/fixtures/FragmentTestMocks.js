module.exports = {
    Query: `
        query tests { ...Test1 }
    `,
    InlineQuery: `
        query tests { ...Inline2 }
    `,
    Test1: `
        fragment Test1 on Any {
            totalCount
            data {
                ...Test2
            }
        }
    `,
    Test2: `
        fragment Test2 on Any {
            id
            brand
            titles {
                ...Test4
            }
            images(subType: "Medium") {
                ...Test3
            }
        }
    `,
    Test3: `
        fragment Test3 on Any {
            url
            id
            type
            subType
        }
    `,
    Test4: `
        fragment Test4 on Any {
            name
        }
    `,
    Inline1: `
        url
        id
        type
        subType
    `,
    Inline2: `
        count
        data { ...Inline1 }
        extra { ...Inline3 }
    `,
    Inline3: `
        description
        { ...Inline1 }
    `,
};
