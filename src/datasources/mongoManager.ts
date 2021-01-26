import appDebugger from 'debug';
import { MongoClient, MongoClientOptions } from 'mongodb';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:mongodb-manager');

class MongoManager {
    private static client: MongoClient;

    public static async connect(config: any): Promise<MongoClient> {
        debug('Solicitação de conexão recebida');

        if (MongoManager.client) {
            debug('Entregando conexão anteriormente realizada');
            return Promise.resolve(MongoManager.client);
        }
        else {
            debug('Efetuando nova conexão');

            const mongoCfg: any = { ...config };
            const options: MongoClientOptions = config.options;

            try {
                const client: MongoClient = await MongoClient.connect(mongoCfg.url, options);

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

    public static async close(): Promise<void> {
        if (MongoManager.client?.isConnected()) {
            debug('Finalizando conexão');
            await MongoManager.client.close();
            MongoManager.client = undefined;
            debug('Conexão finalizada');
        }
    }

    public static getClient(): MongoClient {
        return MongoManager.client;
    }
}

export default MongoManager;
