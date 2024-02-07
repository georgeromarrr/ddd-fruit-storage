const CreatedFruits = require("./CreatedFruits");
const RemovedFruits = require("./RemovedFruits");
const StoredFruits = require("./StoredFruits");
const UpdatedFruits = require("./UpdatedFruits");

class CronServices {
  constructor() {
    this.CreatedFruits = new CreatedFruits();
    this.StoredFruits = new StoredFruits();
    this.RemovedFruits = new RemovedFruits();
    this.UpdatedFruits = new UpdatedFruits();
  }

  async process() {
    await this.CreatedFruits.execute();
    await this.StoredFruits.execute();
    await this.RemovedFruits.execute();
    await this.UpdatedFruits.execute();
  }
}

module.exports = CronServices;
