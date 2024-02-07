const { Check } = require("@infra/utils");

class EventIdEntity {
  constructor(props) {
    this.create_id = props?.create_id;
    this.update_id = props?.update_id;
    this.storage_id = props?.storage_id;
  }

  _update(props) {
    const fields = {
      create_id: props?.create_id,
      update_id: props?.update_id,
      storage_id: props?.storage_id,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (!Check._isEmpty(value)) {
        this[key] = value;
      }
    }

    return this._clean();
  }

  _clean() {
    const event = {};

    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!Check._isEmpty(value)) {
          event[key] = value;
        }
      }
    }

    return event;
  }
}

module.exports = EventIdEntity;
