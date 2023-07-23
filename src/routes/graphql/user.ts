import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from 'graphql';
import { postType } from './post.js';
import { profileType } from './profile.js';
import { UUIDType } from './types/uuid.js';

export const userType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
    profile: {
      type: profileType,
      resolve: async (
        parent: { id: string },
        args: { id: string },
        context: FastifyInstance,
      ) => {
        return await context.prisma.profile.findUnique({
          where: {
            userId: parent.id,
          },
        });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (
        parent: { id: string },
        args: { id: string },
        context: FastifyInstance,
      ) => {
        return await context.prisma.post.findMany({
          where: {
            authorId: parent.id,
          },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (
        parent: { id: string },
        args: { id: string },
        context: FastifyInstance,
      ) => {
        return await context.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (
        parent: { id: string },
        args: { id: string },
        context: FastifyInstance,
      ) => {
        return await context.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
        });
      },
    },
  }),
});

export const usersQuery = {
  type: new GraphQLList(userType),
  resolve: async (_, __, context: FastifyInstance) => {
    return await context.prisma.user.findMany();
  },
};

export const userQuery = {
  type: userType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: FastifyInstance) => {
    return await context.prisma.user.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  },
});

interface createUserDtoModel {
  name: string;
  balance: number;
}

export const createUserMutation = {
  type: userType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreateUserInput),
    },
  },
  resolve: async (_, args: { dto: createUserDtoModel }, context: FastifyInstance) => {
    return await context.prisma.user.create({
      data: args.dto,
    });
  },
};

export const deleteUserMutation = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: FastifyInstance) => {
    await context.prisma.user.delete({
      where: {
        id: args.id,
      },
    });
  },
};

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  },
});

export const changeUserMutation = {
  type: userType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(ChangeUserInput),
    },
  },
  resolve: async (
    _,
    args: { id: string; dto: createUserDtoModel },
    context: FastifyInstance,
  ) => {
    return await context.prisma.user.update({
      where: {
        id: args.id,
      },
      data: args.dto,
    });
  },
};

export const subscribeToMutation = {
  type: userType,
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (
    _,
    args: { userId: string; authorId: string },
    context: FastifyInstance,
  ) => {
    return await context.prisma.user.update({
      where: {
        id: args.userId,
      },
      data: {
        userSubscribedTo: {
          create: {
            authorId: args.authorId,
          },
        },
      },
    });
  },
};

export const unsubscribeFromMutation = {
  type: GraphQLBoolean,
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (
    _,
    args: { userId: string; authorId: string },
    context: FastifyInstance,
  ) => {
    await context.prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      },
    });
  },
};
