const CreateFruit = require("./CreateFruit");
const DeleteFruit = require("./DeleteFruit");
const FindFruit = require("./FindFruit");
const FindFruitStorage = require("./FindFruitStorage");
const RemoveFruit = require("./RemoveFruit");
const StoreFruit = require("./StoreFruit");
const UpdateFruit = require("./UpdateFruit");

class FruitServices {
  constructor() {
    this.getStorage = new FindFruitStorage();
    this.getFruit = new FindFruit();
    this.createFruit = new CreateFruit();
    this.storeFruit = new StoreFruit();
    this.removeFruit = new RemoveFruit();
    this.updateFruit = new UpdateFruit();
    this.deleteFruit = new DeleteFruit();
  }

  async getFruitStorage() {
    return this.getStorage.execute();
  }

  async findFruit(name) {
    return this.getFruit.execute(name);
  }

  async createFruitForFruitStorage(props) {
    return this.createFruit.execute(props);
  }

  async storeFruitToFruitStorage(props) {
    return this.storeFruit.execute(props);
  }

  async removeFruitFromFruitStorage(props) {
    return this.removeFruit.execute(props);
  }

  async updateFruitForFruitStorage(props) {
    return this.updateFruit.execute(props);
  }

  async deleteFruitFromFruitStorage(props) {
    return this.deleteFruit.execute(props);
  }
}

module.exports = FruitServices;
