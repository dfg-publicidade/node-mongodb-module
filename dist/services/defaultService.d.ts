import Paginate from '@dfgpublicidade/node-pagination-module';
import { Db, FindOneOptions, ObjectId } from 'mongodb';
declare abstract class DefaultService {
    protected static readonly collection: string;
    protected static readonly createdAtField: string;
    protected static readonly updatedAtField: string;
    protected static readonly deletedAtField: string;
    protected static readonly query: any;
    protected static readonly sort: any;
    protected static readonly index: any;
    protected static readonly aggregation: any[];
    protected static readonly collationOptions: any;
    static translateParams(param: string, alias?: string): string;
    protected static hasSorting(): boolean;
    protected static hasIndex(): boolean;
    protected static createIndex(db: Db): Promise<any>;
    protected static list<T>(db: Db, query: any, options?: {
        sort: any;
        paginate: Paginate;
    }): Promise<T[]>;
    protected static count(db: Db, query: any): Promise<number>;
    protected static findById<T>(db: Db, id: string, options?: FindOneOptions<T>): Promise<T>;
    protected static insert<T>(db: Db, entity: T): Promise<T>;
    protected static update<T>(db: Db, entity: {
        _id: ObjectId;
    }, update: any): Promise<T>;
    protected static delete<T>(db: Db, entity: {
        _id: ObjectId;
    }): Promise<T>;
}
export default DefaultService;