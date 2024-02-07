const MutationSchema = require("./MutationSchema");
const Querychema = require("./Querychema");

class Validation {
  constructor() {
    this.mutationSchema = new MutationSchema();
    this.querySchema = new Querychema();
  }

  async mutation(values, options = {}) {
    return this.mutationSchema.execute(values, options);
  }

  async query(values) {
    return this.querySchema.execute(values);
  }
}

module.exports = Validation;
