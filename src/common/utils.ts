import _ from "lodash";
import { getterSetter } from "./resources";
export const yourID = "100009069356507";

export const toObjectKeyedOn = (key: string) => (
  agg: { [k: string]: any },
  curr: { [k: string]: any }
) => {
  agg[curr[key]] = curr;
  return agg;
};

export const join = (as: any[], bs: any[]) => {
  let aJoinB: [any, any][] = [];
  for (const a of as) {
    for (const b of bs) {
      aJoinB.push([a, b]);
    }
  }
  return aJoinB;
};

type update = { [id: string]: { [q: string]: any } };

export type updateStored<T> = (
  [store, setStore]: getterSetter<T>,
  updates: update | update[]
) => void;

/** @todo handle the plural updates case */
export const updateStored: updateStored<any> = (
  [store, setStore],
  _updates
) => {
  //{key:{unreadCount: 0 }}
  const toUpdates = (updateObj: any) => {
    const [key, newVal] = Object.entries(_updates)[0];
    const original = store[key];
    return { [key]: { ...original, ...newVal, __key: key } };
  };
  const updates =
    _updates instanceof Array
      ? _.keyBy(_updates.map(toUpdates), "__key")
      : toUpdates(_updates);

  setStore({
    ...store,
    ...updates
  });
};

export const getNewId = (() => {
  let counter = 0;
  return () => counter++;
})();
