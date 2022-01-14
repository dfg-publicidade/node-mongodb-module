"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const promises_1 = __importDefault(require("fs/promises"));
const mongodb_1 = require("mongodb");
/* Module */
const debug = (0, debug_1.default)('module:mongodb-manager');
class MongoManager {
    static async connect(config) {
        debug('Connection request received ');
        if (!config) {
            throw new Error('Connection config. was not provided.');
        }
        if (MongoManager.client) {
            debug('Delivering previously made connection');
            return Promise.resolve(MongoManager.client);
        }
        else {
            debug('Making a new connection');
            const mongoCfg = Object.assign({}, config);
            const options = config.options;
            if (options.sslCA) {
                options.ca = [await promises_1.default.readFile(options.sslCA)];
            }
            try {
                const client = await mongodb_1.MongoClient.connect(mongoCfg.url, options);
                debug('Connection done');
                MongoManager.client = client;
                return Promise.resolve(MongoManager.client);
            }
            catch (error) {
                debug('Connection attempt error');
                MongoManager.client = undefined;
                return Promise.reject(error);
            }
        }
    }
    static async close() {
        debug('Closing connection');
        if (MongoManager.client) {
            await MongoManager.client.close();
            MongoManager.client = undefined;
        }
        debug('Connection close attempt error');
    }
    static getClient() {
        return MongoManager.client;
    }
}
exports.default = MongoManager;
