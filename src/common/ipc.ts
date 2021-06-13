import { Queue, handleFunc, HandleQueue } from "../../global"

class Observer {
  protected queue: Queue
  protected onceQueue: Queue
  protected handleQueue: HandleQueue
  constructor() {
    this.queue = {}
    this.onceQueue = {}
    this.handleQueue = {}
  }
  private checkChannel(channel: string) {
    if (this.queue[channel] === void 0) this.queue[channel] = new Map()
    if (this.onceQueue[channel] === void 0) this.onceQueue[channel] = new Map()
  }
  on(channel: string, listener: handleFunc): ThisType<this> {
    const sym = JSON.stringify(listener)
    this.checkChannel(channel)
    this.queue[channel].set(sym, listener)
    return this
  }
  once(channel: string, listener: handleFunc): ThisType<this> {
    const sym = JSON.stringify(listener)
    this.checkChannel(channel)
    this.onceQueue[channel].set(sym, listener)
    return this
  }
  handle(channel: string, listener: handleFunc): ThisType<this> {
    this.handleQueue[channel] = { type: 1, listener }
    return this
  }
  handleOnce(channel: string, listener: handleFunc): ThisType<this> {
    this.handleQueue[channel] = { type: 0, listener }
    return this
  }
  listeners(channel: string): Array<handleFunc> {
    const queue = Array.from(this.queue[channel].values())
    const once = Array.from(this.onceQueue[channel].values())
    return queue.concat(once)
  }
  removerListener(channel: string, listener: handleFunc): ThisType<this> {
    const sym = JSON.stringify(listener)
    this.checkChannel(channel)
    this.queue[channel].delete(sym)
    this.onceQueue[channel].delete(sym)
    return this
  }
  removerALLListener(channel: string): ThisType<this> {
    this.checkChannel(channel)
    this.queue[channel].clear()
    this.onceQueue[channel].clear()
    return this
  }
  removeHandle(channel: string) {
    delete this.handleQueue[channel]
  }
}

class IPC extends Observer {
  protected server: WebSocket
  protected hasTarget: boolean = false
  constructor() {
    super()
  }
  async connect(server: WebSocket) {
    this.server = server
    if (this.server.readyState == 0) {
      await new Promise(resolve => {
        this.server.addEventListener('open', () => resolve(null))
      })
    }
    this.hasTarget = true
  }
  protected checkTarget() {
    if (!this.hasTarget) {
      throw new Error("please add a Server!");
    }
  }
  excute(channel: string, args?: any) {
    if (this.queue[channel] === void 0) this.queue[channel] = new Map()
    this.queue[channel].forEach(async (func: handleFunc, sym: string) => {
      const ev = new ipcEvent()
      await ev.connect(this.server)
      func(ev, args)
    })
    if (this.onceQueue[channel] === void 0) this.onceQueue[channel] = new Map()
    this.onceQueue[channel].forEach(async (func: handleFunc, sym: string) => {
      const ev = new ipcEvent()
      await ev.connect(this.server)
      func(ev, args)
    })
    this.onceQueue[channel].clear()
  }
  async excuteSync(channel: string, args?: any) {
    const ev = new ipcEvent()
    await ev.connect(this.server)
    const { type, listener } = this.handleQueue[channel]
    if (type == 0) this.removeHandle(channel)
    var result = await listener(ev, args)
    const data = {
      channel: `#${channel}`,
      args: result
    }
    const res = JSON.stringify(data)
    this.server.send(res)
  }
  async invoke(channel: string, args?: any): Promise<any> {
    await this.connect(this.server)
    const data = {
      channel: `$${channel}`,
      args
    }
    const res = JSON.stringify(data)
    this.server.send(res)
    return new Promise(resolve => {
      this.on(`#${channel}`, (_, r) => {
        resolve(r)
      })
    })
  }
}

export class ipcMain extends IPC {
  private serverQueue: string[] = []
  constructor() {
    super()
  }
  send(channel: string, args?: any): any {
    const data = {
      channel,
      args
    }
    const res = JSON.stringify(data)
    this.serverQueue.push(res)
    return this
  }
  broadcast(): void {
    this.serverQueue.forEach(res => this.server.send(res))
    this.serverQueue.length = 0
  }
}
export class ipcRenderer extends IPC {
  constructor() {
    super()
  }
  async sendSync(channel: string, args?: any){
    const data = {
      channel:`$${channel}`,
      args
    }
    const res = JSON.stringify(data)
    this.checkTarget()
    this.server.send(res)
    var result=await new Promise(resolve => {
      this.on(`#${channel}`, (_, r) => {
        resolve(r)
      })
    })
    return result
  }
  send(channel: string, args?: any) {
    const data = {
      channel,
      args
    }
    const res = JSON.stringify(data)
    this.checkTarget()
    this.server.send(res)
    return this
  }
}
export class ipcEvent extends IPC {
  constructor() {
    super()
  }
  sender(channel: string, args?: any) {
    this.checkTarget()
    const data = {
      channel,
      args
    }
    const res = JSON.stringify(data)
    this.server.send(res)
  }
  /**
   * reply 
   */
  reply(channel: any, args?: any) {
    this.sender(channel, args)
  }
}
