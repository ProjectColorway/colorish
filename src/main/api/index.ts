import $DataStore from "./DataStore";
import * as $Contexts from "./Contexts";

export const DataStore = $DataStore;
export const Contexts = $Contexts;

export function getFiltered<T extends { [k: string]: any; }>(obj: T, ...excludedKeys: string[]) {
    return Object.keys(obj).reduce(function (r, e) {
        if (!(excludedKeys.includes(e))) r[e] = obj[e];
        return r;
    }, {});
}
