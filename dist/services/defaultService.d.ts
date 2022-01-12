import Paginate from '@dfgpublicidade/node-pagination-module';
import { ClientSession, Db, Document, ObjectId } from 'mongodb';
declare abstract class DefaultService {
    protected static readonly collection: string;
    protected static readonly createdAtField: string;
    protected static readonly updatedAtField: string;
    protected static readonly deletedAtField: string;
    protected static readonly query: any;
    protected static readonly sort: any;
    protected static readonly index: any;
    protected static readonly aggregation: any[];
    protected static readonly options: any;
    protected static hasSorting(): boolean;
    protected static hasIndex(): boolean;
    protected static createIndex(db: Db): Promise<any>;
    protected static list(db: Db, query: any, options?: {
        sort?: any;
        paginate?: Paginate;
    }, session?: ClientSession): Promise<Document[]>;
    protected static count(db: Db, query: any, session?: ClientSession): Promise<number>;
    protected static findBy<T>(db: Db, field: string, value: any, session?: ClientSession): Promise<T>;
    protected static findById<T>(db: Db, id: ObjectId, session?: ClientSession): Promise<T>;
    protected static insert<T>(db: Db, entity: T, session?: ClientSession): Promise<T>;
    protected static update<T>(db: Db, entity: {
        _id: ObjectId;
    }, update: any, session?: ClientSession): Promise<T>;
    protected static delete<T>(db: Db, entity: {
        _id: ObjectId;
    }, session?: ClientSession): Promise<T>;
}
export default DefaultService;
