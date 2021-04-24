import { after, before, describe } from 'mocha';
import { Db, MongoClient } from 'mongodb';
import { MongoManager } from '../../src';

describe('DefaultService', (): void => {
    let db: Db;

    before(async (): Promise<void> => {
        if (!process.env.MONGO_TEST_URL) {
            throw new Error('MONGO_TEST_URL must be set.');
        }

        const client: MongoClient = await MongoManager.connect({
            url: process.env.MONGO_TEST_URL,
            "options": {
                "poolSize": 20,
                "useNewUrlParser": true,
                "useUnifiedTopology": true
            }
        });

        db = client.db();

        
    });

    after(async (): Promise<void> => {
        // await connection.manager.query('DROP TABLE Test3');
        // await connection.manager.query('DROP TABLE Test2');
        // await connection.manager.query('DROP TABLE Test');

        await MongoManager.close();
    });
});
