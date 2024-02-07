const FruitRepo = require("@infra/repos/fruits");
const EventServices = require("@domain/services/events");
const Fruit = require("@domain/factories/fruit");

class CreateFruit {
  async execute(payload) {
    try {
      const fruit = new Fruit(payload);

      const newEvent = await new EventServices({
        event_type: "createFruit",
      }).createEvent(fruit.create());

      return await new FruitRepo().createFruit(
        fruit.event({ create_id: newEvent.id })
      );
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = CreateFruit;
