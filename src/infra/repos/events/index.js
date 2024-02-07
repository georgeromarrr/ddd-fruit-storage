const { Check } = require("@infra/utils");
const CreateEvent = require("./CreateEvent");
const GetAllEvent = require("./GetAllEvent");
const UpdateEvent = require("./UpdateEvent");

class EventRepo {
  constructor() {
    this.CreateEvent = new CreateEvent();
    this.GetAllEvent = new GetAllEvent();
    this.UpdateEvent = new UpdateEvent();
  }

  findAllEvent(filter) {
    return this.GetAllEvent.findAll(filter);
  }

  createEvent(event) {
    if (Check._isEmpty(event)) {
      throw new Error(`Missing event data`);
    }

    return this.CreateEvent.create(event);
  }

  updateEvent(data) {
    if (Check._isEmpty(data)) {
      throw new Error(`Missing event data`);
    }

    return this.UpdateEvent.update(data);
  }
}

module.exports = EventRepo;
