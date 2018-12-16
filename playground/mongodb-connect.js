const { MongoClient, ObjectId } = require('mongodb');

MongoClient.connect(
  'mongodb://localhost:27017/TodoApp',
  (err, client) => {
    if (err) {
      return console.log('There was an error connecting to the mongodb server');
    }
    console.log('Connected to mongodb server');
    // const db = client.db('TodoApp');

    // db.collection('Todos').insertOne(
    //   {
    //     text: 'something to do',
    //     completed: false
    //   },
    //   (err, result) => {
    //     if (err) {
    //       return console.log('unable to insert to do', err);
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    //   }
    // );

    const db = client.db('UsersTest');

    db.collection('Users').insertOne(
      {
        name: 'Max',
        age: 24,
        location: 'US'
      },
      (err, results) => {
        if (err) {
          return console.log('unable to insert into db');
        }
        console.log(JSON.stringify(results.ops, undefined, 2));
      }
    );

    client.close();
  }
);
