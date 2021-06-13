import { listeners } from "process";
import { ipcEvent } from "./src/common/ipc";

interface handleFunc {
  (event: ipcEvent, arg: any): any
}
interface Queue {
  [propName: string]: Map<string, handleFunc>
}
interface HandleQueue {
  [propName: string]: {
    type: number,
    listener: handleFunc
  }
}

// declare const ws:WebSocket