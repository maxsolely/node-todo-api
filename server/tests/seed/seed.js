const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const todos = [
  { _id: new ObjectID(), text: 'first test todo' },
  {
    _id: new ObjectID(),
    text: 'second test todo',
    completed: true,
    completedAt: 333
  },
  { _id: new ObjectID(), text: 'third test todo' }
];

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
  {
    _id: userOneId,
    email: 'max@example.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'nick@example.com',
    password: 'userTwoPass'
  }
];

//clear Todos before testing anything

const populateTodos = done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

const populateUsers = done => {
  User.remove({})
    .then(() => {
      // we want to create new instances because if we just insertMany like we do in the populateTodos, the middleware will never be called and the passwords will not be hashed
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();

      //The callback will not be fired until both userOne and userTwo promises are resolved
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = { todos, populateTodos, users, populateUsers };
