const yup = require("yup");

class MutationSchema {
  constructor() {
    this.schema = yup.object().shape({
      name: yup.string().required("Fruit name is required"),
      amount: yup
        .number()
        .integer()
        .when("$hasAmount", {
          is: true,
          then: yup.number().required("Fruit amount is required"),
        }),
      description: yup
        .string()
        .when("$isUpdate", {
          is: true,
          then: yup.string().test({
            name: "at-least-one-present",
            message:
              "Either description or limitOfFruitToBeStored must be present",
            test: function (value) {
              const limitOfFruitToBeStored = this.resolve(
                yup.ref("limitOfFruitToBeStored")
              );
              return value || limitOfFruitToBeStored;
            },
          }),
        })
        .when("$isCreate", {
          is: true,
          then: yup.string().required("Fruit description is required"),
        }),
      limitOfFruitToBeStored: yup
        .number()
        .integer()
        .when("$isUpdate", {
          is: true,
          then: yup.number().test({
            name: "at-least-one-present",
            message:
              "Either description or limitOfFruitToBeStored must be present",
            test: function (value) {
              const description = this.resolve(yup.ref("description"));
              return value || description;
            },
          }),
        })
        .when("$isCreate", {
          is: true,
          then: yup
            .number()
            .required("Limit of fruit to be Stored is required"),
        }),
    });
  }

  execute(values, { isUpdate = false, hasAmount = false, isCreate = false }) {
    return this.schema.validate(values, {
      abortEarly: false,
      context: { isUpdate, hasAmount, isCreate },
    });
  }
}

module.exports = MutationSchema;
