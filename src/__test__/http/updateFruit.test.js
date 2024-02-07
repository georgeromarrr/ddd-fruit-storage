require("../utils/toBeEmpty");

const ApolloServer = require("@infra/http/ApolloServer");
const startTestServer = require("../helpers");
const { toPromise } = require("apollo-link");

const Model = require("@infra/database/models");

const { CREATE_FRUIT_MUTATION, FIND_FRUIT_QUERY, UDPATE_FRUIT_MUTATION, STORE_FRUIT_MUTATION } = require("../utils/query");

describe("Update Fruit Test suites", () => {
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
    test("Fruit name equals to empty string", async () => {
      const fruit = graphql({
        query: UDPATE_FRUIT_MUTATION,
        variables: {
          name: "",
          description: "this is a fruit description",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.updateFruitForFruitStorage.status).toBe("error");
      expect(res.data.updateFruitForFruitStorage.message).toEqual("Fruit name is required");
      expect(res.data.updateFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit description equals to empty string ", async () => {
      const fruit = graphql({
        query: UDPATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.updateFruitForFruitStorage.status).toBe("error");
      expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.updateFruitForFruitStorage.data).toBeEmpty();
    });

    test("Missing both Fruit description and limits", async () => {
      const fruit = graphql({
        query: UDPATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.updateFruitForFruitStorage.status).toBe("error");
      expect(res.data.updateFruitForFruitStorage.message).toEqual("Either description or limitOfFruitToBeStored must be present");
      expect(res.data.updateFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit description is less than 5 characters", async () => {
      const fruit = graphql({
        query: UDPATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "this",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.updateFruitForFruitStorage.status).toBe("error");
      expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.updateFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit description is more than 30 characters", async () => {
      const fruit = graphql({
        query: UDPATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "this is a fruit with a very long description",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.updateFruitForFruitStorage.status).toBe("error");
      expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.updateFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit limits is equals to a negative value", async () => {
      const fruit = graphql({
        query: UDPATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "this is a fruit description",
          limitOfFruitToBeStored: -100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.updateFruitForFruitStorage.status).toBe("error");
      expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.updateFruitForFruitStorage.data).toBeEmpty();
    });

    describe("- Assert Errors when deleting fruits ", () => {
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

      describe("- Assert pre-requisites of creation and storage of fruits", () => {
        test("Create Orange fruit, it must be successful", async () => {
          expect(createdFruitStatus).toBe("success");
          expect(createdFruitMessage).not.toBeEmpty();
          expect(createdFruitData).not.toBeEmpty();
        });

        test("Store fruit amount equals to the limit storage", async () => {
          const fruit = graphql({
            query: STORE_FRUIT_MUTATION,
            variables: {
              name: createdFruitData[0].name,
              amount: createdFruitData[0].limitOfFruitToBeStored - 2,
            },
          });
          const res = await toPromise(fruit);

          expect(res.data.storeFruitToFruitStorage.status).toBe("success");
          expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
          expect(res.data.storeFruitToFruitStorage.data).not.toBeEmpty();
        });
      });

      describe("- Assert execution", () => {
        test("Update fruit storage limits less than the current storage limits amount", async () => {
          const fruit = graphql({
            query: UDPATE_FRUIT_MUTATION,
            variables: {
              name: createdFruitData[0].name,
              limitOfFruitToBeStored: 1,
            },
          });
          const res = await toPromise(fruit);

          expect(res.data.updateFruitForFruitStorage.status).toBe("error");
          expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
          expect(res.data.updateFruitForFruitStorage.data).toBeEmpty();
        });
      });
    });
  });

  describe("2. Updates fruit storage limits greater than fruits amount", () => {
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

    describe("- Assert pre-requisites of creation and storage of fruits", () => {
      test("Create Orange fruit, it must be successful", async () => {
        expect(createdFruitStatus).toBe("success");
        expect(createdFruitMessage).not.toBeEmpty();
        expect(createdFruitData).not.toBeEmpty();
      });

      test("Store fruit amount equals to the limit storage ", async () => {
        const fruit = graphql({
          query: STORE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount: createdFruitData[0].limitOfFruitToBeStored,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.storeFruitToFruitStorage.status).toBe("success");
        expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
        expect(res.data.storeFruitToFruitStorage.data).not.toBeEmpty();
      });
    });

    describe("- Assert execution and verifications", () => {
      test("Update fruit storage, it must successfuly be updated storage to 6", async () => {
        const fruit = graphql({
          query: UDPATE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            limitOfFruitToBeStored: createdFruitData[0].limitOfFruitToBeStored + 1,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.updateFruitForFruitStorage.status).toBe("success");
        expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
        expect(res.data.updateFruitForFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the new storage limits is 6 in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData.limitOfFruitToBeStored).toEqual(6);
      });
    });

    describe("- Assert Fruit event is created when a fruit is updated", () => {
      let fruitData;

      beforeAll(async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        fruitData = fruitModelData;
      });

      test("Fruit event update_id is available", async () => {
        expect(fruitData.event.update_id).not.toBeNull();
      });

      test("Verify Event is saved on the database", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.update_id).exec();
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to updateFruit", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.update_id).exec();
        expect(fruitEvent.event_type).toBe("updateFruit");
      });

      describe("- Assert Fruit event payload", () => {
        let fruitEvent;

        beforeAll(async () => {
          const fruitModelData = await Model.Event.findById(fruitData.event.update_id).exec();
          fruitEvent = fruitModelData;
        });

        test("Verify the result of payload id is the same as updated fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("id", createdFruitData[0].id);
        });
      });
    });
  });

  describe("3. Updates fruit storage limits based on the current storage limit value while fruits amount is zero", () => {
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

    describe("- Assert pre-requisites of creation of fruits", () => {
      test("Create Orange fruit, it must be successful", async () => {
        expect(createdFruitStatus).toBe("success");
        expect(createdFruitMessage).not.toBeEmpty();
        expect(createdFruitData).not.toBeEmpty();
      });
    });

    describe("- Assert execution and verifications", () => {
      test("Update fruit storage, it must successfuly be updated storage to 10", async () => {
        const fruit = graphql({
          query: UDPATE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            limitOfFruitToBeStored: 10,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.updateFruitForFruitStorage.status).toBe("success");
        expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
        expect(res.data.updateFruitForFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the new storage limits is equals to 10 in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData.limitOfFruitToBeStored).toEqual(10);
      });

      test("Update fruit storage, it must successfuly be updated storage to 4", async () => {
        const fruit = graphql({
          query: UDPATE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            limitOfFruitToBeStored: 4,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.updateFruitForFruitStorage.status).toBe("success");
        expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
        expect(res.data.updateFruitForFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the new storage limits is equals to 4 in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData.limitOfFruitToBeStored).toEqual(4);
      });
    });

    describe("- Assert Fruit event is created when a fruit is updated", () => {
      let fruitData;

      beforeAll(async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        fruitData = fruitModelData;
      });

      test("Fruit event update_id is available", async () => {
        expect(fruitData.event.update_id).not.toBeNull();
      });

      test("Verify Event is saved on the database", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.update_id).exec();
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to updateFruit", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.update_id).exec();
        expect(fruitEvent.event_type).toBe("updateFruit");
      });

      describe("- Assert Fruit event payload", () => {
        let fruitEvent;

        beforeAll(async () => {
          const fruitModelData = await Model.Event.findById(fruitData.event.update_id).exec();
          fruitEvent = fruitModelData;
        });

        test("Verify the result of payload id is the same as updated fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("id", createdFruitData[0].id);
        });
      });
    });
  });

  describe("3. Updates fruit description", () => {
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

    describe("- Assert pre-requisites of creation of fruits", () => {
      test("Create Orange fruit, it must be successful", async () => {
        expect(createdFruitStatus).toBe("success");
        expect(createdFruitMessage).not.toBeEmpty();
        expect(createdFruitData).not.toBeEmpty();
      });
    });

    describe("- Assert execution and verifications", () => {
      test("Update fruit descriptions, it must successfuly be updated", async () => {
        const fruit = graphql({
          query: UDPATE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            description: "a new fruit description",
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.updateFruitForFruitStorage.status).toBe("success");
        expect(res.data.updateFruitForFruitStorage.message).not.toBeEmpty();
        expect(res.data.updateFruitForFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the new fruits description in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData.description).toBe("a new fruit description");
      });
    });

    describe("- Assert Fruit event is created when a fruit is updated", () => {
      let fruitData;

      beforeAll(async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        fruitData = fruitModelData;
      });

      test("Fruit event update_id is available", async () => {
        expect(fruitData.event.update_id).not.toBeNull();
      });

      test("Verify Event is saved on the database", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.update_id).exec();
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to updateFruit", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.update_id).exec();
        expect(fruitEvent.event_type).toBe("updateFruit");
      });

      describe("- Assert Fruit event payload", () => {
        let fruitEvent;

        beforeAll(async () => {
          const fruitModelData = await Model.Event.findById(fruitData.event.update_id).exec();
          fruitEvent = fruitModelData;
        });

        test("Verify the result of payload id is the same as updated fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("id", createdFruitData[0].id);
        });

        test("Verify the result of payload id is the same as updated fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("description", "a new fruit description");
        });
      });
    });
  });
});
