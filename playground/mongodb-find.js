const { MongoClient, ObjectId } = require('mongodb');

MongoClient.connect(
  'mongodb://localhost:27017/TodoApp',
  (err, client) => {
    if (err) {
      return console.log('There was an error connecting to the mongodb server');
    }
    console.log('Connected to mongodb server');
    const db = client.db('TodoApp');

    // db.collection('Todos')
    //   .find({ completed: false })
    //   .toArray()
    //   .then(
    //     docs => {
    //       console.log('Todos:');
    //       console.log(JSON.stringify(docs, undefined, 2));
    //     },
    //     err => {
    //       console.log('There was an error printing to the screen');
    //     }
    //   );

    db.collection('Todos')
      .find()
      .count()
      .then(
        count => {
          console.log('Todos:');
          console.log(count);
        },
        err => {
          console.log('There was an error printing to the screen');
        }
      );

    // client.close();
  }
);
