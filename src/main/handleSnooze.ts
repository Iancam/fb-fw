import { Snoozer } from "../common";
import { readFile, writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";
import { ipcMain } from "electron";
import _ from "lodash";
import { SNOMessage } from "../renderer/snoozeMessageLogic";
import { messageID } from "facebook-chat-api";

const SNOOZED_DATA_PATH = join("static", "snoozed", "files.json");

let snoozerDS: SNOMessage[] = [];

export const loadSnoozerDS = () => {
  return promisify(readFile)(SNOOZED_DATA_PATH)
    .then(v => JSON.parse(v.toString()))
    .then(d => {
      snoozerDS = d instanceof Array ? d : [];

      return snoozerDS;
    });
};
/** this should be handled by some other part of the system */
export const snoozeMessage = (event: Electron.Event, data: SNOMessage) => {
  console.log("snoozed in cold storage");
  snoozerDS.push(data);
  saveSnoozerDS();
};

export const saveSnoozerDS = () => {
  writeFile(
    SNOOZED_DATA_PATH,
    JSON.stringify(snoozerDS),
    err => err && console.warn("saving of snoozed messages failed: ", err)
  );
};

export const initSnoozer = () => {
  ipcMain.on("POST_SNOOZE_MESSAGE", (e: Electron.Event, data: SNOMessage) => {
    e.sender.send("POST_SNOOZER_RCV", data);
    snoozeMessage(e, data);
  });
  ipcMain.on(
    "DELETE_SNOOZE_MESSAGE",
    (e: Electron.Event, messageID: messageID) => {
      snoozerDS = snoozerDS.filter(el => el.message.messageID !== messageID);
    }
  );

  ipcMain.on("GET_SNOOZE_MESSAGES", (e: Electron.Event, data?: any) => {
    loadSnoozerDS()
      .then(d => e.sender.send("GET_SNOOZE_MESSAGES_RCV", d))
      .catch(er => {
        console.warn(er);
        console.log(snoozerDS);
      });
  });
};
