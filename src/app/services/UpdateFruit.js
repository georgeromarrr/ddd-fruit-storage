const { Result, Check } = require("@infra/utils");
const FruitRepo = require("@infra/repos/fruits");
const FruitServices = require("@domain/services/fruits");

class UpdateFruit {
  async execute({ name, description, limitOfFruitToBeStored }) {
    try {
      const fruit = await new FruitRepo().findFruit({ name });

      if (Check._isEmpty(fruit)) {
        return Result.fail(`${name} does not exist or has been removed`);
      }

      await new FruitServices().validateFruit({
        method: "updateFruit",
        props: { name, description, limitOfFruitToBeStored },
        data: fruit,
      });

      const updatedFruit = await new FruitServices().updateFruit({
        event_type: "updateFruit",
        payload: { id: fruit.id, description, limitOfFruitToBeStored },
      });

      if (
        (Check._isEmpty(fruit.limitOfFruitToBeStored) && fruit.description === updatedFruit.description) ||
        (Check._isEmpty(fruit.description) && fruit.limitOfFruitToBeStored === updatedFruit.limitOfFruitToBeStored) ||
        (!Check._isEmpty(fruit.description) &&
          !Check._isEmpty(fruit.limitOfFruitToBeStored) &&
          fruit.description === updatedFruit.description &&
          fruit.limitOfFruitToBeStored === updatedFruit.limitOfFruitToBeStored)
      ) {
        return Result.fail("No changes found or applied");
      }

      return Result.verify({
        data: updatedFruit,
        success: `Successfully applied ${name} changes`,
        error: "No changes found or applied",
      });
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = UpdateFruit;
