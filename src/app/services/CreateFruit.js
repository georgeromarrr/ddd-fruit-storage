const { Result, Check } = require("@infra/utils");
const FruitRepo = require("@infra/repos/fruits");
const FruitServices = require("@domain/services/fruits");

class CreateFruit {
  async execute(props) {
    try {
      await new FruitServices().validateFruit({ method: "createFruit", props });

      const fruitExist = await new FruitRepo().findFruit(props);

      if (!Check._isEmpty(fruitExist)) {
        return Result.fail(`Unable to create ${props.name}, the same fruit already exists in the storage. Fruit name must be unique.`);
      }

      const fruit = await new FruitServices().createFruit(props);

      return Result.verify({
        data: fruit,
        success: `Successfully created ${props.name}`,
        error: `Something went wrong. Unable to create ${props.name}`,
      });
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = CreateFruit;
