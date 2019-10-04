/* eslint-disable no-throw-literal */
const Sequelize = require('sequelize');
const { UUID, UUIDV4, STRING } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/zl_kc_db');
const jwt = require('jwt-simple');

const User = conn.define('user', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  email: {
    type: STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: STRING,
    allowNull: false
  }
});

User.findByToken = async function(token) {
  try {
    const { id } = jwt.decode(token, process.env.SECRET);
    const user = await this.findByPk(id);
    return user;
  } catch (ex) {
    throw ({ status: 401});
  }
}

User.authenticate = async function({ email, password }) {
  const user = await this.findOne({where: {email, password}})
  if (user) {
    return jwt.encode({ id: user.dataValues.id }, process.env.SECRET)
  }
  throw ({status: 401});
}

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const users = [
    { name: 'moe' },
    { name: 'larry' },
    { name: 'lucy' },
    { name: 'ethyl' }
  ];
  const [moe, larry, lucy, ethyl] = await Promise.all(
      users.map( user => User.create({ email: `${user.name}@gmail.com`, password: user.name.toUpperCase()}))
  );
};

module.exports = {
  models: {
    User
  },
  syncAndSeed
};
