"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
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
    static async list(db, query, options) {
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
        return collection.aggregate(aggregation, Object.assign({}, this.options)).toArray();
    }
    static async count(db, query) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        const collection = db.collection(this.collection);
        const aggregation = [
            ...this.aggregation,
            {
                $match: Object.assign(Object.assign({}, this.query), query)
            },
            {
                $count: 'docs'
            }
        ];
        const result = await collection.aggregate(aggregation, Object.assign({}, this.options)).toArray();
        return result[0] ? result[0].docs : 0;
    }
    static async findById(db, id) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!id) {
            throw new Error('ID must be provided.');
        }
        if (!mongodb_1.ObjectId.isValid(id)) {
            throw new Error('ID must be valid.');
        }
        const collection = db.collection(this.collection);
        const aggregation = [
            ...this.aggregation,
            {
                $match: Object.assign(Object.assign({}, this.query), { _id: new mongodb_1.ObjectId(id) })
            },
            {
                $limit: 1
            }
        ];
        const result = await collection.aggregate(aggregation, Object.assign({}, this.options)).toArray();
        return result.length > 0 ? result[0] : undefined;
    }
    static async insert(db, entity) {
        if (!db) {
            throw new Error('Database must be provided.');
        }
        if (!entity) {
            throw new Error('Entity must be provided.');
        }
        const collection = db.collection(this.collection);
        entity[this.createdAtField] = new Date();
        const result = await collection.insertOne(entity);
        return result.ops[0];
    }
    static async update(db, entity, update) {
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
        const options = { returnOriginal: false };
        set.$set[this.updatedAtField] = new Date();
        const result = await collection.findOneAndUpdate(query, set, options);
        return result.value;
    }
    static async delete(db, entity) {
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
        const options = { returnOriginal: false };
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
