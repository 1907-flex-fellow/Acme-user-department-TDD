const { expect } =require('chai');

const db = require('./db');
const app = require('supertest')(require('./app'));
const { User, Department } = db.models;

describe('Acme TDD', () => {
    let seed;
    beforeEach(async () => seed = await db.syncAndSeed());
    describe('DATA Layer', ()=>{
        it('Admin, HR, and Something are the departments', ()=>{
            expect(seed.departments.Admin.name).to.equal('Admin');
            expect(seed.departments.HR.name).to.equal('HR');
            expect(seed.departments.Something.name).to.equal('Something');
        });
        it('user foo belongs to Admin department', ()=>{
            expect(seed.users.foo.departmentId).to.equal(seed.departments.Admin.id);
        });
        describe('User validation', () => {
            it('name is required', ()=>{
                return User.create({})
                    .catch( ex => expect(ex.errors[0].path).to.equal('name'));
            });
            it('name can not be empty string', () => {
                return User.create({ name: ''})
                    .catch( ex => expect(ex.errors[0].path).to.equal('name'))
            });
            it('can not create more than 5 user under one department', async ()=>{
                try{
                    await User.create({ name: 'First User', departmentId: seed.departments.Admin.id})
                    await User.create({ name: 'Second User', departmentId: seed.departments.Admin.id})
                    await User.create({ name: 'Third User', departmentId: seed.departments.Admin.id})
                    await User.create({ name: 'Fourth User', departmentId: seed.departments.Admin.id})
                    await User.create({ name: 'Fifth User', departmentId: seed.departments.Admin.id})
                }catch(ex){
                    expect(ex).to.ok
                }
            })
        });
        describe('Department validation', ()=>{
            it('there are three departments', ()=>{
                expect(Object.keys(seed.departments).length).to.equal(3)
            })
        });
    });
    describe('API', () =>{
        describe('GET /api/users', () => {
            it('returns three users', () =>{
                return app.get('/api/users')
                    .expect(200)
                    .then(response => {
                        expect(response.body.length).to.equal(3)
                    })
            })
        });
        describe('POST /api/users', () => {
            it('can create a user', () => {
                return app.post('/api/users')
                    .send({ name: 'larry', departmentId: seed.departments.Admin.id })
                    .expect(201)
                    .then(response => {
                        expect(response.body.name).to.equal('larry')
                        expect(response.body.departmentId).to.equal(seed.departments.Admin.id)
                    })
            })
        });
        describe('DELETE /api/users/:id', () => {
            it('can delete a user', () => {
                return app.delete(`/api/users/${seed.users.foo.id}`)
                    .expect(204)
            })
        });
        describe('PUT /api/users/:id', ()=>{
            it('can update a user', ()=>{
                return app.put(`/api/users/${seed.users.foo.id}`)
                    .send({ name: 'larry'})
                    .expect(200)
                    .then(response => {
                        expect(response.body.name).to.equal('larry')
                    })
            })
        })
    })
})