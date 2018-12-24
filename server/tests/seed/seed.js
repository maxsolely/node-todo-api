const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const todos = [
  { _id: new ObjectID(), text: 'first test todo', _creator: userOneId },
  {
    _id: new ObjectID(),
    text: 'second test todo',
    completed: true,
    completedAt: 333,
    _creator: userOneId
  },
  { _id: new ObjectID(), text: 'third test todo', _creator: userTwoId }
];

const users = [
  {
    _id: userOneId,
    email: 'max@example.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET)
          .toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'nick@example.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET)
          .toString()
      }
    ]
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
