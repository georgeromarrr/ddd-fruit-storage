const Check = require("./Check");

class Result {
  constructor(status, message, data) {
    this.status = status;
    this.message = message;
    this.data = data;

    if (this.status !== "success" && !message) {
      throw new Error(
        "InvalidOperation: A failing result needs to contain an error message"
      );
    }

    if (message && typeof message !== "string") {
      throw new Error("InvalidOperation: Error message must be string");
    }
  }

  static ok(data, message) {
    return new Result("success", message, Array.isArray(data) ? data : [data]);
  }

  static fail(message) {
    return new Result("error", message);
  }

  static verify({ data, success, error }) {
    if (Check._isEmpty(data)) {
      return this.fail(error);
    }

    return this.ok(data, success);
  }
}

module.exports = Result;
