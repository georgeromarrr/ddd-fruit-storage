const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class SearchFruit {
  async execute(filter) {
    try {
      const fruits = await Model.Fruit.find(filter).lean().exec();
      return fruits.map((fruit) => Map.Fruit.toDomain(fruit));
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = SearchFruit;
