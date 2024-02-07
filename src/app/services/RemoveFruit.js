const { Result, Check } = require("@infra/utils");
const FruitRepo = require("@infra/repos/fruits");
const FruitServices = require("@domain/services/fruits");

class RemoveFruit {
  async execute({ name, amount }) {
    try {
      const fruit = await new FruitRepo().findFruit({ name });

      if (Check._isEmpty(fruit)) {
        return Result.fail(`${name} does not exist or has been removed`);
      }

      await new FruitServices().validateFruit({
        method: "removeFruit",
        props: { name, amount },
        data: fruit,
      });

      const updateFruit = await new FruitServices().updateFruit({
        event_type: "removeFruit",
        payload: {
          id: fruit.id,
          name,
          amount: amount * -1,
        },
      });

      return Result.verify({
        data: updateFruit,
        success: `Successfully remove ${amount} ${name}`,
        error: "No changes found or applied",
      });
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = RemoveFruit;
