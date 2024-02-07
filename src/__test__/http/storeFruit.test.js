require("../utils/toBeEmpty");

const ApolloServer = require("@infra/http/ApolloServer");
const startTestServer = require("../helpers");
const { toPromise } = require("apollo-link");

const Model = require("@infra/database/models");

const { CREATE_FRUIT_MUTATION, STORE_FRUIT_MUTATION } = require("../utils/query");

describe("Store Fruit Test suites", () => {
  let stop, graphql, detachDB, destroyDB;

  const fruitProps = {
    name: "Orange",
    description: "this is a fruit description",
    limitOfFruitToBeStored: 5,
    amount: 1,
  };

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

  describe("1. Validate Errors of Input Fields", () => {
    test("Store Fruit amount to non-existent fruit", async () => {
      const fruit = graphql({
        query: STORE_FRUIT_MUTATION,
        variables: {
          name: "Not-so-a-fruit",
          amount: 10,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.storeFruitToFruitStorage.status).toBe("error");
      expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
      expect(res.data.storeFruitToFruitStorage.data).toBeEmpty();
    });

    test("Fruit name equals to empty string", async () => {
      const fruit = graphql({
        query: STORE_FRUIT_MUTATION,
        variables: {
          name: "",
          amount: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.storeFruitToFruitStorage.status).toBe("error");
      expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
      expect(res.data.storeFruitToFruitStorage.data).toBeEmpty();
    });

    test("Missing Fruit amount", async () => {
      const fruit = graphql({
        query: STORE_FRUIT_MUTATION,
        variables: {
          name: "",
          amount: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.storeFruitToFruitStorage.status).toBe("error");
      expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
      expect(res.data.storeFruitToFruitStorage.data).toBeEmpty();
    });

    describe("- Assert Errors when storing fruits ", () => {
      let createdFruitData, createdFruitStatus, createdFruitMessage;

      beforeAll(async () => {
        const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
        const fruitResult = await toPromise(createFruit);

        createdFruitData = fruitResult.data.createFruitForFruitStorage.data;
        createdFruitStatus = fruitResult.data.createFruitForFruitStorage.status;
        createdFruitMessage = fruitResult.data.createFruitForFruitStorage.message;
      });

      afterAll(async () => {
        await destroyDB();
      });

      describe("- Assert pre-requisites of fruit creation", () => {
        test("Create Orange fruit, it must be successful", async () => {
          expect(createdFruitStatus).toBe("success");
          expect(createdFruitMessage).not.toBeEmpty();
          expect(createdFruitData).not.toBeEmpty();
        });
      });

      test.each([{ amount: 0 }, { amount: -5 }])("Store fruit amount equals to $amount", async ({ amount }) => {
        const fruit = graphql({
          query: STORE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.storeFruitToFruitStorage.status).toBe("error");
        expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
        expect(res.data.storeFruitToFruitStorage.data).toBeEmpty();
      });

      test("Store fruit amount greater than the storage limit", async () => {
        const fruit = graphql({
          query: STORE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount: createdFruitData[0].limitOfFruitToBeStored + 1,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.storeFruitToFruitStorage.status).toBe("error");
        expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
        expect(res.data.storeFruitToFruitStorage.data).toBeEmpty();
      });
    });
  });

  describe("2. Store Fruits on storage", () => {
    let createdFruitData, createdFruitStatus, createdFruitMessage;

    beforeAll(async () => {
      const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
      const fruitResult = await toPromise(createFruit);

      createdFruitData = fruitResult.data.createFruitForFruitStorage.data;
      createdFruitStatus = fruitResult.data.createFruitForFruitStorage.status;
      createdFruitMessage = fruitResult.data.createFruitForFruitStorage.message;
    });

    describe("- Assert pre-requisites of fruit creation", () => {
      test("Create Orange fruit, it must be successful", async () => {
        expect(createdFruitStatus).toBe("success");
        expect(createdFruitMessage).not.toBeEmpty();
        expect(createdFruitData).not.toBeEmpty();
      });
    });

    describe("- Assert execution and verifications", () => {
      test.each([{ amount: 1 }, { amount: 2 }, { amount: 1 }])("Store $amount fruit in a storage, it must successfuly be stored", async ({ amount }) => {
        const fruit = graphql({
          query: STORE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.storeFruitToFruitStorage.status).toBe("success");
        expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
        expect(res.data.storeFruitToFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the total amount incremented in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData.amount).toEqual(4);
      });
    });

    describe("- Assert Fruit event is created when a fruit is stored", () => {
      let fruitData;

      beforeAll(async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        fruitData = fruitModelData;
      });

      test("Fruit event storage_id is available", async () => {
        expect(fruitData.event.storage_id).not.toBeNull();
      });

      test("Verify Event is saved on the database", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.storage_id).exec();
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to storeFruit", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.storage_id).exec();
        expect(fruitEvent.event_type).toBe("storeFruit");
      });

      describe("- Assert Fruit event payload", () => {
        let fruitEvent;

        beforeAll(async () => {
          const fruitModelData = await Model.Event.findById(fruitData.event.storage_id).exec();
          fruitEvent = fruitModelData;
        });

        test("Verify the result of payload id is the same as stored fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("id", createdFruitData[0].id);
        });

        test("Verify the result of payload name is the same as inputted", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("name", fruitProps.name);
        });

        test("Verify the result of payload amount is the same as inputted", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("amount", fruitProps.amount);
        });
      });
    });
  });
});
