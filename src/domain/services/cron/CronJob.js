const cron = require("cron");

class CronJobScheduler {
  constructor(callback) {
    this.callback = callback;

    if (this.callback) {
      this.callback();
    }

    // "*/30 * * * * *" run every 30s
    // "*/5 * * * *" run every 5m
    this.job = new cron.CronJob("*/15 * * * * *", () => {
      console.log("Scheduled job is running...");
      if (this.callback) {
        this.callback();
      }
    });
    console.log("Cron job scheduled to run every 5 minutes.");
    this.job.start();
  }
}

module.exports = CronJobScheduler;
