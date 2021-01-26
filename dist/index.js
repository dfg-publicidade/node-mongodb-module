"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const mongodb_1 = require("mongodb");
/* Module */
const debug = debug_1.default('module:mongodb-manager');
class MongoManager {
    static async connect(config) {
        debug('Solicitação de conexão recebida');
        if (MongoManager.client) {
            debug('Entregando conexão anteriormente realizada');
            return Promise.resolve(MongoManager.client);
        }
        else {
            debug('Efetuando nova conexão');
            const mongoCfg = Object.assign({}, config);
            const options = config.options;
            try {
                const client = await mongodb_1.MongoClient.connect(mongoCfg.url, options);
                debug('Conexão realizada');
                MongoManager.client = client;
                return Promise.resolve(MongoManager.client);
            }
            catch (error) {
                debug('Erro na tentativa de conexão');
                throw error;
            }
        }
    }
    static async close() {
        var _a;
        if ((_a = MongoManager.client) === null || _a === void 0 ? void 0 : _a.isConnected()) {
            debug('Finalizando conexão');
            await MongoManager.client.close();
            MongoManager.client = undefined;
            debug('Conexão finalizada');
        }
    }
    static getClient() {
        return MongoManager.client;
    }
}
exports.default = MongoManager;
