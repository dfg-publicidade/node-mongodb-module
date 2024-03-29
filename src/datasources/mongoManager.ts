import appDebugger from 'debug';
import fs from 'fs/promises';
import { MongoClient, MongoClientOptions } from 'mongodb';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:mongodb-manager');

class MongoManager {
    private static client: MongoClient;

    public static async connect(config: any): Promise<MongoClient> {
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

            const mongoCfg: any = { ...config };
            const options: MongoClientOptions = config.options;

            if (options.sslCA) {
                options.ca = [await fs.readFile(options.sslCA as unknown as string)];
            }

            try {
                const client: MongoClient = await MongoClient.connect(mongoCfg.url, options);

                debug('Connection done');

                MongoManager.client = client;
                return Promise.resolve(MongoManager.client);
            }
            catch (error: any) {
                debug('Connection attempt error');
                MongoManager.client = undefined;
                return Promise.reject(error);
            }
        }
    }

    public static async close(): Promise<void> {
        debug('Closing connection');

        if (MongoManager.client) {
            await MongoManager.client.close();
            MongoManager.client = undefined;
        }

        debug('Connection close attempt error');
    }

    public static getClient(): MongoClient {
        return MongoManager.client;
    }
}

export default MongoManager;
