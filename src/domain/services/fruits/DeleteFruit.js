const FruitRepo = require("@infra/repos/fruits");
const EventServices = require("@domain/services/events");
const Fruit = require("@domain/factories/fruit");

class DeleteFruit {
  async execute(payload) {
    try {
      const fruit = new Fruit(payload).create();

      const newEvent = await new EventServices({
        event_type: "deleteFruit",
      }).createEvent(fruit);

      return await new FruitRepo().deleteFruit(fruit);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = DeleteFruit;
