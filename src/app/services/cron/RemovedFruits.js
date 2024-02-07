const { Result, Check } = require("@infra/utils");
const EventRepo = require("@infra/repos/events");
const FruitRepo = require("@infra/repos/fruits");

class RemovedFruits {
  async execute() {
    try {
      const events = await new EventRepo().findAllEvent({ event_type: "removeFruit", is_processed: false });

      if (events.length <= 0) {
        console.log("No removeFruit documents needs to be processed...");
        return;
      }

      for (const ev of events) {
        const fruits = await new FruitRepo().searchFruit({ "event.storage_id": ev.id, is_sent: false });
        await new EventRepo().updateEvent({ id: ev.id, is_processed: true });

        if (fruits.length <= 0) {
          console.log("No removeFruit documents needs to be process as sent...");
          return;
        }

        for (const fr of fruits) {
          await new EventRepo().updateEvent({ id: ev.id, is_sent: true });
        }
      }
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = RemovedFruits;
