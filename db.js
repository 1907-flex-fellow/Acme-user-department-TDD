const Sequelize = require('sequelize');
const { UUID, UUIDV4, STRING } = Sequelize

const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme-user-deparment-app', { logging: false });

const uuidDefinition = {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
}

const nameDefinition = {
    type: STRING,
    allowNull: false,
    unique: true,
    validate: {
        notEmpty: true
    }
}

const User = conn.define('user', {
    id: uuidDefinition,
    name: nameDefinition,
}, {
    hooks: {
        beforeSave: async function(user){
            try{
                let count = 0;
                // if(user.departmentId === ''){
                //     user.departmentId = null
                // }
                if(user.departmentId){
                    const users = await User.findAll({where: {
                        departmentId: user.departmentId,
                        id: {
                            [Sequelize.Op.ne]: user.id
                        }
                    }});
                    count = users.length;
                    if(count > 4){
                        const error = new Error();
                        error.message = `there are already ${count} users in this department`;
                        throw error;
                    }
                }
            }
            catch(ex){
                console.log(ex);
                throw ex;
            }
        }
    }
});
const Department = conn.define('department', {
    id: uuidDefinition,
    name: nameDefinition
});

User.belongsTo(Department);

const syncAndSeed = async () => {
    await conn.sync({ force: true});
    const map = (data, model) => data.map(item => model.create(item));

    const acmeDeparments = [
        { name: 'Admin' },
        { name: 'HR' },
        { name: 'Something' }
    ];

    const [Admin, HR, Something] = await Promise.all(map(acmeDeparments, Department));

    const acmeUsers = [
        { name: 'foo', departmentId: Admin.id },
        { name: 'bar', departmentId: HR.id },
        { name: 'bazz', departmentId: Something.id }
    ];
    const [foo, bar, bazz] = await Promise.all(map(acmeUsers, User))

    return {
        users: {
            foo,
            bar,
            bazz
        },
        departments: {
            Admin,
            HR,
            Something,
        }
    }
}

module.exports = {
    syncAndSeed,
    conn,
    models: {
        User,
        Department
    }
}