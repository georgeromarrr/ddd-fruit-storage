const Event = require("@domain/factories/event");
const Fruit = require("@domain/factories/fruit");
const EventRepo = require("@infra/repos/events");
const { Check } = require("@infra/utils");

class CreateEvent {
  constructor(event) {
    this.event = event;
  }

  async execute(payload) {
    try {
      if (Check._isEmpty(payload)) {
        throw new Error(`Missing event payload`);
      }

      const fruit = new Fruit(payload).create();
      const event = new Event(this.event).update({ payload: fruit });
      return await new EventRepo().createEvent(event);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = CreateEvent;
