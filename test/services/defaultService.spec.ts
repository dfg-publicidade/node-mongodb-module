import Paginate from '@dfgpublicidade/node-pagination-module';
import { expect } from 'chai';
import { after, before, describe, it } from 'mocha';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { DefaultService, MongoManager } from '../../src';

class Test {
    public _id: ObjectId;
    public name: string;
    public code: string;
    public created_at: Date;
    public update_at?: Date;
    public deleted_at?: Date;
}

class TestService extends DefaultService {
    protected static readonly collection: string = 'test';
    protected static readonly query: any = {
        // eslint-disable-next-line no-null/no-null
        deleted_at: null
    };
    protected static readonly sort: any = {
        _id: 1
    };

    public static async listar(db: Db, query: any, options?: {
        sort?: any;
        paginate?: Paginate;
    }): Promise<Test[]> {
        return this.list(db, query, options);
    }

    public static async contar(db: Db, query: any): Promise<number> {
        return this.count(db, query);
    }

    public static async buscarPorId(db: Db, id: string): Promise<Test> {
        return this.findById(db, id);
    }

    public static async inserir(db: Db, entity: Test): Promise<Test> {
        return this.insert(db, entity);
    }

    public static async atualizar(db: Db, entity: Test, update: any): Promise<Test> {
        return this.update(db, entity, update);
    }

    public static async excluir(db: Db, entity: Test): Promise<Test> {
        return this.delete(db, entity);
    }
}

class TestService2 extends TestService {
    protected static readonly index: any = {
        name: 1
    };
}

class TestService3 extends TestService {
    protected static readonly index: any[] = [{
        name: 1,
        code: 1
    }];
}

class TestService4 extends TestService {
    protected static readonly sort: any = undefined;
}

describe('DefaultService', (): void => {
    let db: Db;
    let id: string;

    before(async (): Promise<void> => {
        if (!process.env.MONGO_TEST_URL) {
            throw new Error('MONGO_TEST_URL must be set.');
        }

        const client: MongoClient = await MongoManager.connect({
            url: process.env.MONGO_TEST_URL,
            options: {
                poolSize: 20,
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        });

        db = client.db();

        await db.collection('test').insertOne({
            name: 'Test A',
            code: '0001',
            created_at: new Date()
        });
        await db.collection('test').insertOne({
            name: 'Test B',
            code: '0002',
            created_at: new Date()
        });

        id = (await db.collection('test').findOne({
            name: 'Test A'
        }))._id.toHexString();
    });

    after(async (): Promise<void> => {
        await db.collection('test').drop();

        await MongoManager.close();
    });

    it('1. list', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.listar(undefined, {}, {});
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Database must be provided.');
    });

    it('2. list', async (): Promise<void> => {
        const list: Test[] = await TestService.listar(db, undefined, undefined);

        expect(list).to.exist;
        expect(list).to.not.be.empty;
        expect(list[0]).to.exist;
        expect(list[0]).have.property('name').eq('Test A');
        expect(list[0]).have.property('created_at').not.be.undefined;
    });

    it('3. list', async (): Promise<void> => {
        const list: Test[] = await TestService2.listar(db, undefined, undefined);

        expect(list).to.exist;
        expect(list).to.not.be.empty;
        expect(list[0]).to.exist;
        expect(list[0]).have.property('name').eq('Test A');
        expect(list[0]).have.property('created_at').not.be.undefined;

        const indexes: any[] = await db.collection('test').indexes();

        expect((indexes).filter((index: any): boolean => (index.key === 'name'))).to.exist;
    });

    it('4. list', async (): Promise<void> => {
        const list: Test[] = await TestService3.listar(db, undefined, undefined);

        expect(list).to.exist;
        expect(list).to.not.be.empty;
        expect(list[0]).to.exist;
        expect(list[0]).have.property('name').eq('Test A');
        expect(list[0]).have.property('created_at').not.be.undefined;

        const indexes: any[] = await db.collection('test').indexes();

        expect((indexes).filter((index: any): boolean => (index.key === 'name'))).to.exist;
        expect((indexes).filter((index: any): boolean => (index.key === 'code'))).to.exist;
    });

    it('5. list', async (): Promise<void> => {
        const list: Test[] = await TestService.listar(db, undefined, {
            sort: {
                name: -1
            }
        });

        expect(list).to.exist;
        expect(list).to.not.be.empty;
        expect(list[0]).to.exist;
        expect(list[0]).have.property('name').eq('Test B');
        expect(list[0]).have.property('created_at').not.be.undefined;
    });

    it('6. list', async (): Promise<void> => {
        const list: Test[] = await TestService4.listar(db, undefined, undefined);

        expect(list).to.exist;
        expect(list).to.not.be.empty;
        expect(list[0]).to.exist;
        expect(list[0]).have.property('name').eq('Test A');
        expect(list[0]).have.property('created_at').not.be.undefined;
    });

    it('7. list', async (): Promise<void> => {
        const list: Test[] = await TestService.listar(db, undefined, {
            paginate: {
                getSkip: (): number => 0,
                // eslint-disable-next-line no-magic-numbers
                getLimit: (): number => 1
            } as Paginate
        });

        expect(list).to.exist;
        expect(list).to.not.be.empty;
        expect(list.length).eq(1);
        expect(list[0]).to.exist;
        expect(list[0]).have.property('name').eq('Test A');
        expect(list[0]).have.property('created_at').not.be.undefined;
    });

    it('8. list', async (): Promise<void> => {
        const list: Test[] = await TestService.listar(db, {
            name: 'Test B'
        }, undefined);

        expect(list).to.exist;
        expect(list).to.not.be.empty;
        expect(list.length).eq(1);
        expect(list[0]).to.exist;
        expect(list[0]).have.property('name').eq('Test B');
        expect(list[0]).have.property('created_at').not.be.undefined;
    });

    it('9. count', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.contar(undefined, {});
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Database must be provided.');
    });

    it('10. count', async (): Promise<void> => {
        const count: number = await TestService.contar(db, undefined);

        expect(count).to.exist;
        expect(count).to.be.eq(2);
    });

    it('11. count', async (): Promise<void> => {
        const count: number = await TestService.contar(db, {
            name: 'Test A'
        });

        expect(count).to.exist;
        expect(count).to.be.eq(1);
    });

    it('13. count', async (): Promise<void> => {
        const count: number = await TestService.contar(db, {
            name: 'Test X'
        });

        expect(count).to.exist;
        expect(count).to.be.eq(0);
    });

    it('14. findById', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.buscarPorId(undefined, id);
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Database must be provided.');
    });

    it('15. findById', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.buscarPorId(db, undefined);
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('ID must be provided.');
    });

    it('16. findById', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.buscarPorId(db, 'invalid');
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('ID must be valid.');
    });

    it('17. findById', async (): Promise<void> => {
        const test: Test = await TestService.buscarPorId(db, id);

        expect(test).to.exist;
        expect(test).have.property('name').eq('Test A');
        expect(test).have.property('created_at').not.be.undefined;
    });

    it('18. findById', async (): Promise<void> => {
        const test: Test = await TestService.buscarPorId(db, new ObjectId().toHexString());

        expect(test).to.be.undefined;
    });

    it('19. insert', async (): Promise<void> => {
        let serviceError: any;
        try {
            const test: Test = new Test();
            test.name = 'Test C';

            await TestService.inserir(undefined, test);
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Database must be provided.');
    });

    it('20. insert', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.inserir(db, undefined);
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Entity must be provided.');
    });

    it('21. insert', async (): Promise<void> => {
        let test: Test = new Test();
        test.name = 'Test C';

        await TestService.inserir(db, test);

        test = await db.collection('test').findOne({
            name: 'Test C'
        });

        expect(test).to.exist;
        expect(test).have.property('name').eq('Test C');
        expect(test).have.property('created_at').not.be.undefined;
    });

    it('22. update', async (): Promise<void> => {
        let serviceError: any;
        try {
            const test: Test = await db.collection('test').findOne({
                name: 'Test C'
            });

            await TestService.atualizar(undefined, test, {
                name: 'Test C1'
            });
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Database must be provided.');
    });

    it('23. update', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.atualizar(db, undefined, {
                name: 'Test C1'
            });
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Entity must be provided.');
    });

    it('24. update', async (): Promise<void> => {
        let serviceError: any;
        try {
            const test: Test = await db.collection('test').findOne({
                name: 'Test C'
            });

            await TestService.atualizar(db, test, undefined);
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Update data must be provided.');
    });

    it('25. update', async (): Promise<void> => {
        let test: Test = await db.collection('test').findOne({
            name: 'Test C'
        });

        await TestService.atualizar(db, test, {
            name: 'Test C1'
        });

        test = await db.collection('test').findOne({
            name: 'Test C1'
        });

        expect(test).to.exist;
        expect(test).have.property('name').eq('Test C1');
        expect(test).have.property('created_at').not.be.undefined;
        expect(test).have.property('updated_at').not.be.undefined;
    });

    it('26. delete', async (): Promise<void> => {
        let serviceError: any;
        try {
            const test: Test = await db.collection('test').findOne({
                name: 'Test B'
            });

            await TestService.excluir(undefined, test);
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Database must be provided.');
    });

    it('27. delete', async (): Promise<void> => {
        let serviceError: any;
        try {
            await TestService.excluir(db, undefined);
        }
        catch (err: any) {
            serviceError = err;
        }

        expect(serviceError).to.exist;
        expect(serviceError.message).to.be.eq('Entity must be provided.');
    });

    it('25. update', async (): Promise<void> => {
        let test: Test = await db.collection('test').findOne({
            name: 'Test B'
        });

        await TestService.excluir(db, test);

        test = await db.collection('test').findOne({
            name: 'Test B',
            // eslint-disable-next-line no-null/no-null
            deleted_at: null
        });

        expect(test).to.be.null;
    });
});
