import { Snoozer } from "../common";
import { readFile, writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";
import { ipcMain } from "electron";
import { Dict } from "../renderer/stateLogic";
import _ from "lodash";

const SNOOZED_DATA_PATH = join("static", "snoozed", "files.json");

let snoozerDS: Dict<Snoozer> = {};

export const loadSnoozerDS = () => {
  return promisify(readFile)(SNOOZED_DATA_PATH)
    .then(v => JSON.parse(v.toString()))
    .then(d => {
      snoozerDS = d instanceof Array ? _.keyBy(d, "threadID") : d;

      return snoozerDS;
    });
};
/** this should be handled by some other part of the system */
export const snoozeMessage = (event: Electron.Event, data: Snoozer) => {
  console.log("snoozed in cold storage");
  snoozerDS[data.threadID] = data;
};

export const saveSnoozerDS = () => {
  writeFile(
    SNOOZED_DATA_PATH,
    JSON.stringify(snoozerDS),
    err => err && console.warn("saving of snoozed messages failed: ", err)
  );
};

export const initSnoozer = () => {
  ipcMain.on("POST_SNOOZER", (e: Electron.Event, data: Snoozer) => {
    e.sender.send("POST_SNOOZER_RCV", data);
    snoozeMessage(e, data);
  });
  ipcMain.on("DELETE_SNOOZER", (e: Electron.Event, data: Snoozer) => {
    delete snoozerDS[data.threadID];
  });
  ipcMain.on("GET_SNOOZERS", (e: Electron.Event, data?: any) => {
    loadSnoozerDS()
      .then(d => e.sender.send("GET_SNOOZERS_RCV", d))
      .catch(er => {
        console.warn(er);
        console.log(snoozerDS);
      });
  });
};
