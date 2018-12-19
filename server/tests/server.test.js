const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
  { _id: new ObjectID(), text: 'first test todo' },
  { _id: new ObjectID(), text: 'second test todo', completed:true, completedAt: 333 },
  { _id: new ObjectID(), text: 'third test todo' }
];
//clear Todos before testing anything
beforeEach(done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new to do', done => {
    var text = 'Text to do test';
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(3);
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });
});

describe('GET /todos', done => {
  it('should return all todos in db', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    var unkownId = new ObjectID().toHexString;
    request(app)
      .get(`/todos/${unkownId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexId).then(todo => {
          expect(todo).toNotExist();
          done();
        }).catch(e => {
          done(e);
        })
      })
  })

  it('should return 404 if todo not found', (done) => {
    var unkownId = new ObjectID().toHexString;
    request(app)
      .delete(`/todos/${unkownId}`)
      .expect(404)
      .end(done);
  });
  

  it('should return 404 for non-object ids', (done) => {
    request(app)
    .delete('/todos/123')
    .expect(404)
    .end(done);
  })
})

describe('PATCH /todos/:id', () => {
  it('should update to do', done => {
    var hexId = todos[0]._id.toHexString();
    var updatedText = "This should be the next text";
    request(app)
      .patch(`/todos/${hexId}`)
      .send({completed: true, text: updatedText})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedText);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done)

  })

  it('should clear completedAt when todo is not completed', done => {
    var hexId = todos[1]._id.toHexString();
    var updatedText = "This should be the next text!!";
    request(app)
      .patch(`/todos/${hexId}`)
      .send({completed: false, text: updatedText})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done)
  })
})