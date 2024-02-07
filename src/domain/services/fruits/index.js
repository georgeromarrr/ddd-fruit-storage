const UpdateFruit = require("./UpdateFruit");
const CreateFruit = require("./CreateFruit");
const ValidateFruit = require("./ValidateFruit");
const DeleteFruit = require("./DeleteFruit");

class FruitServices {
  validateFruit({ method, props, data }) {
    return new ValidateFruit(props, data).execute(method);
  }

  createFruit(props) {
    return new CreateFruit().execute(props);
  }

  updateFruit({ event_type, payload }) {
    return new UpdateFruit().execute(event_type, payload);
  }

  deleteFruit(props) {
    return new DeleteFruit().execute(props);
  }
}

module.exports = FruitServices;
