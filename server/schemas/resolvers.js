const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        users: async () => {
            return User.find();
        },

        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({_id: context.user._id})
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },

    Mutation: {
        createUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token,user };
        },

        deleteUser: async (parent, args, context) => {
            if (context.user) {
                return User.findOneAndDelete({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError('No user with this email found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return {token, user};
        },

        addBook: async (parent, { bookData }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$push: {addBook: bookData}},
                    {
                        new: true,
                        runValidators: true,
                    }
                );
            }
            throw new AuthenticationError('You need to be logged in!')
        },

        deleteBook: async (parent, { bookId }) => {
            if (context.user) {
                return  User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {saveBook: {bookId: bookId}}},
                    {new: true}
                );
            }
            throw new AuthenticationError('You need to be logged in!')
        },
    },
};

module.exports = resolvers;