import { expect } from 'chai';
import { after, before, describe, it } from 'mocha';
import { MongoClient } from 'mongodb';
import { MongoManager } from '../src';

/* Tests */
describe('MongoManager', (): void => {
    let config: any;
    let client: MongoClient;

    before(async (): Promise<void> => {
        if (!process.env.MONGO_TEST_URL) {
            throw new Error('MONGO_TEST_URL must be set.');
        }
        if (!process.env.MONGO_SSL_TEST_FILE) {
            throw new Error('MONGO_SSL_TEST_FILE must be set.');
        }

        config = {
            url: process.env.MONGO_TEST_URL,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        };
    });

    after(async (): Promise<void> => {
        if (client) {
            client.close();
        }
    });

    it('1. connect', async (): Promise<void> => {
        let connectionError: any;
        try {
            await MongoManager.connect(undefined);
        }
        catch (err) {
            connectionError = err;
        }

        expect(connectionError).to.exist;
        expect(connectionError.message).to.contain('Connection config. was not provided.');
    });

    it('2. connect', async (): Promise<void> => {
        let connectionError: any;
        try {
            client = await MongoManager.connect({
                ...config,
                url: '127.0.0.1'
            });
        }
        catch (err) {
            connectionError = err;
        }

        expect(connectionError).to.exist;
        expect(connectionError.message).to.contain('Invalid connection string');
    });

    it('3. connect', async (): Promise<void> => {
        client = await MongoManager.connect(config);

        expect(client).to.exist;
    });

    it('4. connect', async (): Promise<void> => {
        client = await MongoManager.connect(config);

        expect(client).to.exist;
    });

    it('5. getClient', async (): Promise<void> => {
        client = await MongoManager.getClient();

        expect(client).to.exist;
    });

    it('6. close', async (): Promise<void> => {
        await MongoManager.close();
        client = MongoManager.getClient();

        expect(client).to.not.exist;
    });

    it('7. close', async (): Promise<void> => {
        await MongoManager.close();
        client = MongoManager.getClient();

        expect(client).to.not.exist;
    });

    it('7. close', async (): Promise<void> => {
        client = await MongoManager.connect({
            url: process.env.MONGO_TEST_URL,
            options: {
                ...config.options,
                sslCA: process.env.MONGO_SSL_TEST_FILE
            }
        });

        expect(client).to.exist;
    });
});
