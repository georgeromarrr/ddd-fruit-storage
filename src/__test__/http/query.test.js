const toBeEmpty = require("../utils/toBeEmpty");

const ApolloServer = require("@infra/http/ApolloServer");
const startTestServer = require("../helpers");
const { toPromise } = require("apollo-link");

const { GET_STORAGE_QUERY, FIND_FRUIT_QUERY, CREATE_FRUIT_MUTATION } = require("../utils/query");

describe("Query Test suites", () => {
  let stop, graphql, detachDB, destroyDB;

  beforeAll(async () => {
    const server = new ApolloServer();
    const testServer = await startTestServer(server);

    stop = testServer.stop;
    graphql = testServer.graphql;
    detachDB = testServer.detachDB;
    destroyDB = testServer.destroyDB;
  });

  afterAll(async () => {
    await destroyDB();
    await detachDB();
    await stop();
  });

  describe("1. Fruit Query Tests", () => {
    let fruitStorageData;

    beforeEach(async () => {
      const res = await toPromise(graphql({ query: GET_STORAGE_QUERY }));
      fruitStorageData = res.data.getFruitStorage.data;
    });

    test("Ensure 'name' field is required", async () => {
      const fruit = graphql({ query: FIND_FRUIT_QUERY, variables: { name: "" } });
      const res = await toPromise(fruit);

      expect(res.data.findFruit.status).toBe("error");
      expect(res.data.findFruit.data).toBeEmpty();
    });

    test.each([{ name: "Not-so-a-fruit" }, { name: "Not-so-a-fruit-other" }, { name: "Not-so-a-fruit-another" }])(
      "Find $name fruit, and it must return an error",
      async ({ name }) => {
        const fruit = graphql({ query: FIND_FRUIT_QUERY, variables: { name } });
        const res = await toPromise(fruit);

        expect(res.data.findFruit.status).toBe("error");
        expect(res.data.findFruit.data).toBeEmpty();
      }
    );

    describe("- Assert Fruit storage is empty", () => {
      beforeAll(async () => {
        await destroyDB();
      });

      test("Check Fruit storage is really empty", async () => {
        expect(fruitStorageData).toBeEmpty();
      });

      test.each([{ name: "Orange" }, { name: "Kiwi" }])("Find $name fruit, it must NOT be found and returns an error", async ({ name }) => {
        const findFruit = graphql({ query: FIND_FRUIT_QUERY, variables: { name } });
        const fruitResult = await toPromise(findFruit);

        expect(fruitResult.data.findFruit.status).toBe("error");
        expect(fruitResult.data.findFruit.message).not.toBeEmpty();
        expect(fruitResult.data.findFruit.data).toBeEmpty();
      });

      test.each([{ name: "Orange" }, { name: "Kiwi" }])("Create $name fruit, creation must be successful", async ({ name }) => {
        const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: { name, description: "A fruit called $name", limitOfFruitToBeStored: 10 } });
        const fruitResult = await toPromise(createFruit);

        expect(fruitResult.data.createFruitForFruitStorage.status).toBe("success");
        expect(fruitResult.data.createFruitForFruitStorage.message).not.toBeEmpty();
        expect(fruitResult.data.createFruitForFruitStorage.data).not.toBeEmpty();
      });

      test.each([{ name: "Orange" }, { name: "Kiwi" }])("Find $name fruit, it must be found and returns fruit data", async ({ name }) => {
        const findFruit = graphql({ query: FIND_FRUIT_QUERY, variables: { name } });
        const fruitResult = await toPromise(findFruit);

        expect(fruitResult.data.findFruit.status).toBe("success");
        expect(fruitResult.data.findFruit.message).not.toBeEmpty();
        expect(fruitResult.data.findFruit.data).not.toBeEmpty();
      });
    });
  });
});
