const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: `{Value} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

// *********************************************************************************************************************
// ***************************************** INSTANCE FUNCTIONS (user) *************************************************
// *********************************************************************************************************************

//UserSchema.methods is a function for instances (users) UserScema.statics is a function on the model itself (User)

// I believe toJSON is a function that gets called in the background when you res.send(user) from a successful API call
// we are overriding that method to only return the users id and email, NOT their password, and tokens
UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();

  user.tokens = user.tokens.concat([{ access, token }]);
  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function(token) {
  var user = this;

  // $pull lets you remove items from an array that match certain criteria
  return user.update({
    $pull: {
      tokens: {
        token: token
      }
    }
  });
};

// *********************************************************************************************************************
// ******************************************** MODEL FUNCTIONS (User) *************************************************
// *********************************************************************************************************************

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  // if any errors happen in the try block it automatically goes into the catch block, runs some code there and then continues on with your program
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  // User.findOne returns a promise, so we will retunr that promise so we can do some .then() chaining whenever we call .findByToken
  // to query a nested document you must wrap the query in quotes
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }

    // bcrypt.compare(password, user.password).then(res => {
    //   if (res) {
    //     return user;
    //   }
    // });
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };
