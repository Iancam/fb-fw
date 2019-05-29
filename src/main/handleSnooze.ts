import { Snoozer } from "../common";
import { appendFile } from "fs";
import { join } from "path";
import moment from "moment";

const SNOOZED_DATA_PATH = join("snoozed", "files");

const getNewId = (() => {
  let counter = 0;
  return () => counter++;
})();

/** this should be handled by some other part of the system */
export default (event: Electron.Event, data: Snoozer) => {
  appendFile(
    SNOOZED_DATA_PATH,
    JSON.stringify({ ...data, id: getNewId() }),
    () => {
      console.log("snoozed in cold storage");
    }
  );
  setSnoozeTimer(data);
};

export const setSnoozeTimer = (data: Snoozer) => {
  // if enough time has passed, fire
  const diff = moment(data.time).diff(moment());
  // if too much time has passed
  removeSnoozer(data);
  setTimeout(() => {}, diff);
};

const removeSnoozer = (data: Snoozer) => {};
