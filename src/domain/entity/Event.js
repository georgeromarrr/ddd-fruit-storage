const { Check } = require("@infra/utils");

class EventEntity {
  constructor(props) {
    this.id = props?.id;
    this.event_type = props?.event_type;
    this.is_sent = props?.is_sent;
    this.is_processed = props?.is_processed;
    this.payload = props?.payload;
  }

  _update(props) {
    const fields = {
      id: props?.id,
      event_type: props?.event_type,
      is_sent: props?.is_sent,
      is_processed: props?.is_processed,
      payload: props?.payload,
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

module.exports = EventEntity;
