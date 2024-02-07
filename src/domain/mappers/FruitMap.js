const Fruit = require("@domain/factories/fruit");
const { Check } = require("@infra/utils");

class FruitMap {
  static toDomain(data) {
    if (Check._isEmpty(data)) {
      return {};
    }

    const fruit = new Fruit(data).update({
      id: data._id?.toString(),
    });

    return new Fruit(fruit).event({
      create_id: data.event.create_id?.toString(),
      update_id: data.event.update_id?.toString(),
      storage_id: data.event.storage_id?.toString(),
    });
  }

  static toDatabase(data) {
    if (Check._isEmpty(data)) {
      throw new Error("Missing Data");
    }

    const fruit = new Fruit(data);

    return data.event ? fruit.event(data.event) : fruit.create();
  }
}

module.exports = FruitMap;
