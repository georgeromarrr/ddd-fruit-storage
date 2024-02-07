const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class FindFruitStorage {
  async find() {
    try {
      const fruitStorage = await Model.Fruit.find().lean();

      if (fruitStorage.length <= 0) {
        throw new Error(`Storage empty. Currently no stored fruits.`);
      }

      return fruitStorage.map((fruit) => Map.Fruit.toDomain(fruit));
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = FindFruitStorage;
