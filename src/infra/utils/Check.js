class Check {
  static _isEmpty(data) {
    return (
      data === "" ||
      data === null ||
      data === undefined ||
      (data && typeof data === "object" && Object.keys(data).length === 0) ||
      (data && Array.isArray(data) && data.length === 0)
    );
  }
}

module.exports = Check;
