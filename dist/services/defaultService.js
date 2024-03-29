"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Module */
class DefaultService {
    static hasSorting() {
        return this.sort && Object.keys(this.sort).length > 0;
    }
    static hasIndex() {
        return Object.keys(this.index).length > 0;
    }
    static async createIndex(db) {
        const collection = db.collection(this.collection);
        if (Array.isArray(this.index)) {
            const createIndexes = [];
            for (const index of this.index) {
                createIndexes.push(collection.createIndex(index));
            }
            return Promise.all(createIndexes);
        }
        return collection.createIndex(this.index);
    }
    static async list(db, query, options, session) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        const collection = db.collection(this.collection);
        if (this.hasIndex()) {
            this.createIndex(db);
        }
        let sort;
        if (options && options.sort && Object.keys(options.sort).length > 0) {
            sort = Object.assign({}, options.sort);
        }
        else if (this.hasSorting()) {
            sort = Object.assign({}, this.sort);
        }
        const aggregation = [
            ...this.aggregation,
            {
                $match: Object.assign(Object.assign({}, this.query), query)
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
        return collection.aggregate(aggregation, Object.assign(Object.assign({}, this.options), { session })).toArray();
    }
    static async count(db, query, session) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        const collection = db.collection(this.collection);
        const aggregation = [
            ...this.aggregation,
            {
                $match: Object.assign(Object.assign({}, this.query), query)
            }, {
                $count: 'docs'
            }
        ];
        const result = await collection.aggregate(aggregation, Object.assign(Object.assign({}, this.options), { session })).toArray();
        return result[0] ? result[0].docs : 0;
    }
    static async findBy(db, field, value, session) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!field) {
            throw new Error('Field must be provided.');
        }
        const collection = db.collection(this.collection);
        const query = {};
        query[field] = value;
        const aggregation = [
            ...this.aggregation,
            {
                $match: Object.assign(Object.assign({}, this.query), query)
            }, {
                $limit: 1
            }
        ];
        const result = await collection.aggregate(aggregation, Object.assign(Object.assign({}, this.options), { session })).toArray();
        return result.length > 0 ? result[0] : undefined;
    }
    static async findById(db, id, session) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!id) {
            throw new Error('ID must be provided.');
        }
        return this.findBy(db, '_id', id, session);
    }
    static async insert(db, entity, session) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!entity) {
            throw new Error('Entity must be provided.');
        }
        const collection = db.collection(this.collection);
        entity[this.createdAtField] = new Date();
        const result = await collection.insertOne(entity, {
            session
        });
        return this.findById(db, result.insertedId, session);
    }
    static async update(db, entity, update, session) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!entity) {
            throw new Error('Entity must be provided.');
        }
        if (!update) {
            throw new Error('Update data must be provided.');
        }
        const collection = db.collection(this.collection);
        const query = { _id: entity._id };
        const set = {
            $set: Object.assign({}, update)
        };
        const options = { returnDocument: 'after', session };
        set.$set[this.updatedAtField] = new Date();
        const result = await collection.findOneAndUpdate(query, set, options);
        return result.value ? this.findById(db, result.value._id, session) : undefined;
    }
    static async delete(db, entity, session) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!entity) {
            throw new Error('Entity must be provided.');
        }
        const collection = db.collection(this.collection);
        const query = { _id: entity._id };
        const set = {
            $set: {}
        };
        const options = { returnDocument: 'before', session };
        set.$set[this.deletedAtField] = new Date();
        const result = await collection.findOneAndUpdate(query, set, options);
        return result.value;
    }
}
DefaultService.collection = undefined;
DefaultService.createdAtField = 'created_at';
DefaultService.updatedAtField = 'updated_at';
DefaultService.deletedAtField = 'deleted_at';
DefaultService.query = {};
DefaultService.sort = {};
DefaultService.index = {};
DefaultService.aggregation = [];
DefaultService.options = {
    collation: {
        locale: 'pt',
        strength: 1
    }
};
exports.default = DefaultService;
