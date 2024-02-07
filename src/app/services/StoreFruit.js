const { Result, Check } = require("@infra/utils");
const FruitServices = require("@domain/services/fruits");
const FruitRepo = require("@infra/repos/fruits");

class StoreFruit {
  async execute({ name, amount }) {
    try {
      const fruit = await new FruitRepo().findFruit({ name });

      if (Check._isEmpty(fruit)) {
        return Result.fail(`${name} does not exist or has been removed`);
      }

      await new FruitServices().validateFruit({
        method: "storeFruit",
        props: { name, amount },
        data: fruit,
      });

      const updateFruit = await new FruitServices().updateFruit({
        event_type: "storeFruit",
        payload: {
          id: fruit.id,
          name,
          amount,
        },
      });

      return Result.verify({
        data: updateFruit,
        success: `Successfully stored ${amount} ${name}`,
        error: "No changes found or applied",
      });
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = StoreFruit;
