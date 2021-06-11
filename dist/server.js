'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/* global Reflect, Promise */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}

var Observer = /** @class */ (function () {
    function Observer() {
        this.queue = {};
        this.onceQueue = {};
    }
    Observer.prototype.checkChannel = function (channel) {
        if (this.queue[channel] === void 0)
            this.queue[channel] = new Map();
        if (this.onceQueue[channel] === void 0)
            this.onceQueue[channel] = new Map();
    };
    Observer.prototype.on = function (channel, listener) {
        var sym = JSON.stringify(listener);
        this.checkChannel(channel);
        this.queue[channel].set(sym, listener);
        return this;
    };
    Observer.prototype.once = function (channel, listener) {
        var sym = JSON.stringify(listener);
        this.checkChannel(channel);
        this.onceQueue[channel].set(sym, listener);
        return this;
    };
    Observer.prototype.removerListener = function (channel, listener) {
        var sym = JSON.stringify(listener);
        this.checkChannel(channel);
        this.queue[channel]["delete"](sym);
        this.onceQueue[channel]["delete"](sym);
        return this;
    };
    Observer.prototype.removerALLListener = function (channel) {
        this.checkChannel(channel);
        this.queue[channel].clear();
        this.onceQueue[channel].clear();
        return this;
    };
    return Observer;
}());
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server() {
        var _this = _super.call(this) || this;
        _this.hasTarget = false;
        return _this;
    }
    Server.prototype.connect = function (server) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.server = server;
                        if (!(this.server.readyState == 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                _this.server.addEventListener('open', function () { return resolve(null); });
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.hasTarget = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.checkTarget = function () {
        if (!this.hasTarget) {
            throw new Error("please add a Server!");
        }
    };
    Server.prototype.excute = function (channel, args) {
        var _this = this;
        if (this.queue[channel] === void 0)
            this.queue[channel] = new Map();
        this.queue[channel].forEach(function (func, sym) {
            var ev = new ipcEvent();
            ev.connect(_this.server);
            func(ev, args);
        });
        if (this.onceQueue[channel] === void 0)
            this.onceQueue[channel] = new Map();
        this.onceQueue[channel].forEach(function (func, sym) {
            var ev = new ipcEvent();
            ev.connect(_this.server);
            func(ev, args);
        });
        this.onceQueue[channel].clear();
    };
    return Server;
}(Observer));
var IPC = /** @class */ (function (_super) {
    __extends(IPC, _super);
    function IPC() {
        var _this = _super.call(this) || this;
        _this.serverQueue = [];
        _this.ipcType = typeof window == 'undefined' ? 'server' : 'web';
        return _this;
    }
    IPC.prototype.send = function (channel, args) {
        // send message
        var data = {
            channel: channel,
            args: args
        };
        console.log(this.ipcType);
        var res = JSON.stringify(data);
        if (this.ipcType === 'server')
            this.serverQueue.push(res);
        else {
            this.checkTarget();
            this.server.send(res);
        }
        return this;
    };
    IPC.prototype.serverSend = function () {
        var _this = this;
        this.serverQueue.forEach(function (res) { return _this.server.send(res); });
        this.serverQueue.length = 0;
    };
    return IPC;
}(Server));
var ipcEvent = /** @class */ (function (_super) {
    __extends(ipcEvent, _super);
    function ipcEvent() {
        return _super.call(this) || this;
    }
    ipcEvent.prototype.sender = function (channel, args) {
        this.checkTarget();
        var data = {
            channel: channel,
            args: args
        };
        var res = JSON.stringify(data);
        this.server.send(res);
    };
    /**
     * reply
     */
    ipcEvent.prototype.reply = function (channel, args) {
        this.sender(channel, args);
    };
    return ipcEvent;
}(Server));

var WSocket = require('ws');
function createIPC(server) {
    var wss = new WSocket.Server({ noServer: true });
    var ipc = new IPC();
    wss.on('connection', function connection(ws) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ipc.connect(ws)];
                    case 1:
                        _a.sent();
                        ipc.serverSend();
                        ws.on('message', function incoming(msg) {
                            var _a = JSON.parse(msg), channel = _a.channel, args = _a.args;
                            ipc.excute(channel, args);
                        });
                        return [2 /*return*/];
                }
            });
        });
    });
    server.on('upgrade', function upgrade(request, socket, head) {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    });
    return ipc;
}

module.exports = createIPC;
