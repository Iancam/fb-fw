import _ from "lodash";
import {
  FBAPI,
  command,
  thread,
  actionatePayload,
  message
} from "facebook-chat-api";
import { promisify } from "util";

export type getterSetter<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export enum FBResource {
  friends = "friends",
  messages = "messages",
  threads = "threads"
}

export const actionate = (
  command: command,
  resource: FBResource,
  rec: boolean
) => {
  const base = [command, resource].map(x => x.toUpperCase()).join("_");
  return rec ? "RCV_" + base : base;
};

/** convert mapping (finally) to resource:apiCall mapping, and a composition of promisify and ctx */
export const resourceToRequest = (api: FBAPI) => {
  return {
    friends: {
      /**
       * @param {(err, success)=>any} cb
       */
      get: (payload: {}) => {
        return new Promise((resolve, reject) => reject("not implemented yet"));
      }
    },
    messages: {
      get: ({
        payload,
        ctx
      }: {
        payload: actionatePayload<"get", FBResource.messages, false>;
        ctx?: {};
      }) => {
        return promisify(api.getThreadHistory)(...payload).then(
          (payload: message[]) => ({
            payload: _.keyBy(payload, "messageID"),
            ctx
          })
        );
      },
      post: ({
        payload,
        ctx
      }: {
        payload: actionatePayload<"post", FBResource.messages, false>;
        ctx?: {};
      }) => {
        console.log(payload);

        return promisify(api.sendMessage)(...payload).then((payload: any) => ({
          payload,
          ctx
        }));
      }
    },
    threads: {
      get: ({
        payload = [20, null, ["INBOX"]],
        ctx
      }: {
        payload?: actionatePayload<"get", FBResource.threads, false>;
        ctx?: any;
      }) => {
        return promisify(api.getThreadList)(...payload).then(
          (data: thread[]) => ({ payload: _.keyBy(data, "threadID"), ctx })
        );
      }
    }
  };
};
