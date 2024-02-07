const { makeSchema } = require("nexus");
const { join } = require("path");
const Types = require("../types");

const schema = makeSchema({
  types: [Types],
  outputs: {
    schema: join(__dirname, "../../../../schema.graphql"),
    typegen: join(__dirname, "../../../../fruit-typegen.ts"),
  },
});

module.exports = schema;
