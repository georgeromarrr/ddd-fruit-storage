const yup = require("yup");

class Querychema {
  constructor() {
    this.schema = yup.object().shape({
      name: yup.string().required("Fruit name is required"),
    });
  }

  execute(values) {
    return this.schema.validate(values, { abortEarly: false });
  }
}

module.exports = Querychema;
