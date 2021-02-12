import appDebugger from 'debug';
import { MongoClient, MongoClientOptions } from 'mongodb';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:mongodb-manager');

class MongoManager {
    private static client: MongoClient;

    public static async connect(config: any): Promise<MongoClient> {
        debug('Connection request received ');

        if (MongoManager.client) {
            debug('Delivering previously made connection');
            return Promise.resolve(MongoManager.client);
        }
        else {
            debug('Making a new connection');

            const mongoCfg: any = { ...config };
            const options: MongoClientOptions = config.options;

            try {
                const client: MongoClient = await MongoClient.connect(mongoCfg.url, options);

                debug('Connection done');

                MongoManager.client = client;
                return Promise.resolve(MongoManager.client);
            }
            catch (error) {
                debug('Connection attempt error');
                return Promise.reject(error);
            }
        }
    }

    public static async close(): Promise<void> {
        if (MongoManager.client?.isConnected()) {
            debug('Closing connection');

            await MongoManager.client.close();
            MongoManager.client = undefined;

            debug('Connection close attempt error');
        }
    }

    public static getClient(): MongoClient {
        return MongoManager.client;
    }
}

export default MongoManager;
