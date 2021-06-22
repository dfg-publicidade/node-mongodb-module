import Paginate from '@dfgpublicidade/node-pagination-module';
import { ClientSession, Collection, Db, FindOneAndUpdateOption, ObjectId } from 'mongodb';

/* Module */
abstract class DefaultService {
    protected static readonly collection: string = undefined;
    protected static readonly createdAtField: string = 'created_at';
    protected static readonly updatedAtField: string = 'updated_at';
    protected static readonly deletedAtField: string = 'deleted_at';
    protected static readonly query: any = {};
    protected static readonly sort: any = {};
    protected static readonly index: any = {};
    protected static readonly aggregation: any[] = [];
    protected static readonly options: any = {
        collation: {
            locale: 'pt',
            strength: 1
        }
    };

    protected static hasSorting(): boolean {
        return this.sort && Object.keys(this.sort).length > 0;
    }

    protected static hasIndex(): boolean {
        return Object.keys(this.index).length > 0;
    }

    protected static async createIndex(db: Db): Promise<any> {
        const collection: Collection = db.collection(this.collection);

        if (Array.isArray(this.index)) {
            const createIndexes: Promise<any>[] = [];

            for (const index of this.index) {
                createIndexes.push(collection.createIndex(index));
            }

            return Promise.all(createIndexes);
        }

        return collection.createIndex(this.index);
    }

    protected static async list<T>(db: Db, query: any, options?: {
        sort?: any;
        paginate?: Paginate;
    }, session?: ClientSession): Promise<T[]> {
        if (!db) {
            throw new Error('Database must be provided.');
        }

        const collection: Collection = db.collection(this.collection);

        if (this.hasIndex()) {
            this.createIndex(db);
        }

        let sort: any;
        if (options && options.sort && Object.keys(options.sort).length > 0) {
            sort = {
                ...options.sort
            };
        }
        else if (this.hasSorting()) {
            sort = {
                ...this.sort
            };
        }

        const aggregation: any[] = [
            ...this.aggregation,
            {
                $match: {
                    ...this.query,
                    ...query
                }
            }
        ];

        if (sort) {
            aggregation.push({
                $sort: sort
            });
        }

        if (options && options.paginate) {
            aggregation.push({ $skip: options.paginate.getSkip() });
            aggregation.push({ $limit: options.paginate.getLimit() });
        }

        return collection.aggregate(aggregation, {
            ...this.options,
            session
        }).toArray();
    }

    protected static async count(db: Db, query: any, session?: ClientSession): Promise<number> {
        if (!db) {
            throw new Error('Database must be provided.');
        }

        const collection: Collection = db.collection(this.collection);

        const aggregation: any[] = [
            ...this.aggregation,
            {
                $match: {
                    ...this.query,
                    ...query
                }
            }, {
                $count: 'docs'
            }
        ];

        const result: any = await collection.aggregate(aggregation, {
            ...this.options,
            session
        }).toArray();

        return result[0] ? result[0].docs : 0;
    }

    protected static async findById<T>(db: Db, id: ObjectId, session?: ClientSession): Promise<T> {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!id) {
            throw new Error('ID must be provided.');
        }

        const collection: Collection = db.collection(this.collection);

        const aggregation: any[] = [
            ...this.aggregation,
            {
                $match: {
                    ...this.query,
                    _id: id
                }
            }, {
                $limit: 1
            }
        ];

        const result: any = await collection.aggregate(aggregation, {
            ...this.options,
            session
        }).toArray();

        return result.length > 0 ? result[0] : undefined;
    }

    protected static async insert<T>(db: Db, entity: T, session?: ClientSession): Promise<T> {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!entity) {
            throw new Error('Entity must be provided.');
        }

        const collection: Collection = db.collection(this.collection);

        entity[this.createdAtField] = new Date();

        const result: any = await collection.insertOne(entity, {
            session
        });

        return result.ops[0];
    }

    protected static async update<T>(db: Db, entity: { _id: ObjectId }, update: any, session?: ClientSession): Promise<T> {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!entity) {
            throw new Error('Entity must be provided.');
        }
        if (!update) {
            throw new Error('Update data must be provided.');
        }

        const collection: Collection = db.collection(this.collection);

        const query: any = { _id: entity._id };
        const set: any = {
            $set: {
                ...update
            }
        };
        const options: FindOneAndUpdateOption<T> = { returnNewDocument: true, session };

        set.$set[this.updatedAtField] = new Date();

        const result: any = await collection.findOneAndUpdate(query, set, options);

        return result.value;
    }

    protected static async delete<T>(db: Db, entity: { _id: ObjectId }, session?: ClientSession): Promise<T> {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!entity) {
            throw new Error('Entity must be provided.');
        }

        const collection: Collection = db.collection(this.collection);

        const query: any = { _id: entity._id };
        const set: any = {
            $set: {}
        };
        const options: FindOneAndUpdateOption<T> = { returnReturnNewDocument: false, session };

        set.$set[this.deletedAtField] = new Date();

        const result: any = await collection.findOneAndUpdate(query, set, options);

        return result.value;
    }
}

export default DefaultService;
