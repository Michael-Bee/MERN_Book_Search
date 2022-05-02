const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({_id: context.user._id}).select("-__v -password");
            }
            throw new AuthenticationError('Please log in');
        },
    },

    Mutation: {
        createUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return {token, user};
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$push: {saveBook: bookData}},
                    {
                        new: true,
                        runValidators: true,
                    }
                );
            }
            throw new AuthenticationError('Please log in')
        },

        deleteBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return  User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {saveBook: {bookId: bookId}}},
                    {new: true}
                );
            }
            throw new AuthenticationError('Please log in')
        },
    },
};

module.exports = resolvers;