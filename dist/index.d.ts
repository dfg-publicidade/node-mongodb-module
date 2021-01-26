import { MongoClient } from 'mongodb';
declare class MongoManager {
    private static client;
    static connect(config: any): Promise<MongoClient>;
    static close(): Promise<void>;
    static getClient(): MongoClient;
}
export default MongoManager;
