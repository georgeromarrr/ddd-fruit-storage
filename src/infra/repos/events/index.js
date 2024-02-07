const { Check } = require("@infra/utils");
const CreateEvent = require("./CreateEvent");

class EventRepo {
  constructor() {
    this.CreateEvent = new CreateEvent();
  }

  createEvent(event) {
    if (Check._isEmpty(event)) {
      throw new Error(`Missing event data`);
    }

    return this.CreateEvent.create(event);
  }
}

module.exports = EventRepo;
