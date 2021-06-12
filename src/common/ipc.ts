import { Queue, handleFunc, ipcType, handleQueue, excuteType } from "../../global"

class Observer {
  protected queue: Queue
  protected onceQueue: Queue
  protected handleQueue: handleQueue
  protected handleOnceQueue: handleQueue
  constructor() {
    this.queue = {}
    this.onceQueue = {}
    this.handleQueue = {}
    this.handleOnceQueue = {}
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
    this.handleQueue[channel] = listener
    return this
  }
  handleOnce(channel: string, listener: handleFunc): ThisType<this> {
    this.handleOnceQueue[channel] = listener
    return this
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
}

class Server extends Observer {
  protected server: WebSocket
  public hasTarget: boolean = false
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
  private createIpcEvent(): ipcEvent {
    const ev = new ipcEvent()
    ev.connect(this.server)
    return ev
  }
  protected checkTarget() {
    if (!this.hasTarget) {
      throw new Error("please add a Server!");
    }
  }
  excute(channel: string, type: excuteType, args?: any) {
    if (type == 'send') {
      if (this.queue[channel] === void 0) this.queue[channel] = new Map()
      this.queue[channel].forEach((func: handleFunc, sym: string) => {
        func(this.createIpcEvent(), args)
      })
      if (this.onceQueue[channel] === void 0) this.onceQueue[channel] = new Map()
      this.onceQueue[channel].forEach((func: handleFunc, sym: string) => {
        func(this.createIpcEvent(), args)
      })
      this.onceQueue[channel].clear()
    }
    else if (type == 'invoke') {
      const queue = this.handleQueue
      const results = []
      for (let key in queue) {
        let result = queue[key](this.createIpcEvent(), args)
        results.push(result)
      }
      const onceQueue = this.handleOnceQueue
      for (let key in onceQueue) {
        onceQueue[key](this.createIpcEvent(), args)
      }
      this.handleOnceQueue = {}
    } else {
      throw new Error("could not  excute type!");
    }
  }
}

export class IPC extends Server {
  protected ipcType: ipcType
  private serverQueue: string[] = []
  constructor() {
    super()
    this.ipcType = typeof window == 'undefined' ? 'server' : 'web'
  }
  send(channel: string, args?: any): IPC {
    // send message
    const data = {
      channel,
      type: 'send',
      args
    }
    const res = JSON.stringify(data)
    if (this.ipcType === 'server')
      this.serverQueue.push(res)
    else {
      this.checkTarget()
      this.server.send(res)
    }
    return this
  }
  /**
   * @returns  Promise<result>
   */
  async invoke(channel: string, args?: any): Promise<any> {
    const data = {
      channel,
      type: 'invoke',
      args
    }
    const res = JSON.stringify(data)
    // await 
    if (this.ipcType === 'server')
      this.serverQueue.push(res)
    else {
      this.checkTarget()
      this.server.send(res)
    }
    return this
  }
  serverSend(): void {
    this.serverQueue.forEach(res => this.server.send(res))
    this.serverQueue.length = 0
  }

}

export class ipcEvent extends Server {
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
