const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    //get the current logged in user 
    me: async (parent, args, context) => {
        // context.user will give us ID/authentication status
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    }
  },
   Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return {token, user};
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({username, email, password});
      const token = signToken(user);
      return {token, user};
    },
    saveBook: async (parent, {bookId}, context) => {
      if (context.user) {
        const updated = await User.findByIdAndUpdate(
          {_id: context.user._id},
          {$addToSet:{ savedBooks: bookId}}
        );
        return updated;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, {bookId}, context) => {
        if (context.user) {
        const updated = await User.findByIdAndUpdate(
          {_id: context.user._id},
          {$pull:{ savedBooks: bookId}},
          {new:true}
        );
        return updated;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    },

   };


module.exports = resolvers;