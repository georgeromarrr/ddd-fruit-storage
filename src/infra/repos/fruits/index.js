const { Check } = require("@infra/utils");
const CreateFruit = require("./CreateFruit");
const FindFruit = require("./FindFruit");
const FindFruitStorage = require("./FindFruitStorage");
const UpdateFruit = require("./UpdateFruit");
const DeleteFruit = require("./DeleteFruit");
const SearchFruit = require("./SearchFruit");

class FruitRepo {
  constructor() {
    this.FindFruit = new FindFruit();
    this.FindFruitStorage = new FindFruitStorage();
    this.CreateFruit = new CreateFruit();
    this.UpdateFruit = new UpdateFruit();
    this.DeleteFruit = new DeleteFruit();
    this.SearchFruit = new SearchFruit();
  }

  searchFruit(filter) {
    return this.SearchFruit.execute(filter);
  }

  findFruitStorage() {
    return this.FindFruitStorage.find();
  }

  findFruit(data) {
    if (Check._isEmpty(data.name)) {
      throw new Error(`Missing fruit name`);
    }

    return this.FindFruit.find(data);
  }

  createFruit(data) {
    if (Check._isEmpty(data)) {
      throw new Error(`Missing fruit data`);
    }

    return this.CreateFruit.create(data);
  }

  updateFruit(data) {
    if (Check._isEmpty(data)) {
      throw new Error(`Missing fruit data`);
    }

    return this.UpdateFruit.update(data);
  }

  deleteFruit(data) {
    if (Check._isEmpty(data)) {
      throw new Error(`Missing fruit data`);
    }

    return this.DeleteFruit.delete(data);
  }
}

module.exports = FruitRepo;
