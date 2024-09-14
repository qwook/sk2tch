import { gtag, install } from "ga-gtag";

try {
  install(process.env.GTAG);
} catch (e) {}

export function publishEvent(event, options = {}) {
  try {
    gtag("event", event, options);
    if (process.env.NODE_ENV === "development") {
      console.log(event, options);
    }
  } catch (e) {}
}

let eventTimers = {};
export function startEventTimer(event) {
  try {
    if (eventTimers[event]) {
      return;
    }
    eventTimers[event] = Date.now();
    publishEvent(`start_${event}`);
  } catch (e) {}
}

export function stopEventTimer(event) {
  try {
    if (eventTimers[event]) {
      publishEvent(`finish_${event}`, {
        value: Date.now() - eventTimers[event],
      });
    }
  } catch (e) {}
}
