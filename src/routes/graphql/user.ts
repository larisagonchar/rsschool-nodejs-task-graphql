/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import DataLoader from 'dataloader';

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
      resolve: (
        parent: { id: string },
        args: { id: string },
        context: any,
        info: {
          fieldNodes: any;
        },
      ) => {
        const { dataloaders, fastify } = context;

        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids: readonly string[]) => {
            const rows = await fastify.prisma.profile.findMany({
              where: {
                userId: {
                  in: ids,
                },
              },
            });

            const sortedInIdsOrder = ids.map((id) =>
              rows.find((row: { userId: string }) => row.userId === id),
            );

            return sortedInIdsOrder;
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (
        parent: { id: string },
        args: { id: string },
        context: any,
        info: {
          fieldNodes: any;
        },
      ) => {
        const { dataloaders, fastify } = context;

        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids: readonly string[]) => {
            const rows = await fastify.prisma.post.findMany({
              where: {
                authorId: {
                  in: ids,
                },
              },
            });

            const sortedInIdsOrder = ids.map((id) =>
              rows.filter((row: { authorId: string }) => row.authorId === id),
            );

            return sortedInIdsOrder;
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (
        parent: { id: string },
        args: { id: string },
        context: any,
        info: {
          fieldNodes: any;
        },
      ) => {
        const { dataloaders, fastify } = context;

        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids: readonly string[]) => {
            const rows = await fastify.prisma.user.findMany({
              where: {
                subscribedToUser: {
                  some: {
                    subscriberId: {
                      in: ids,
                    },
                  },
                },
              },
              include: {
                subscribedToUser: true,
              },
            });

            const sortedInIdsOrder = ids.map((id) => {
              return rows.filter((row) =>
                row.subscribedToUser.find((sub) => sub.subscriberId === id)
                  ? true
                  : false,
              );
            });

            return sortedInIdsOrder;
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: (
        parent: { id: string },
        args: { id: string },
        context: any,
        info: {
          fieldNodes: any;
        },
      ) => {
        const { dataloaders, fastify } = context;

        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids: readonly string[]) => {
            const rows = await fastify.prisma.user.findMany({
              where: {
                userSubscribedTo: {
                  some: {
                    authorId: {
                      in: ids,
                    },
                  },
                },
              },
              include: {
                userSubscribedTo: true,
              },
            });

            const sortedInIdsOrder = ids.map((id) => {
              return rows.filter((row) =>
                row.userSubscribedTo.find((sub) => sub.authorId === id) ? true : false,
              );
            });

            return sortedInIdsOrder;
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(parent.id);
      },
    },
  }),
});

export const usersQuery = {
  type: new GraphQLList(userType),
  resolve: async (
    _,
    __,
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    return await context.fastify.prisma.user.findMany();
  },
};

export const userQuery = {
  type: userType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (
    _,
    args: { id: string },
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    return await context.fastify.prisma.user.findUnique({
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
  resolve: async (
    _,
    args: { dto: createUserDtoModel },
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    return await context.fastify.prisma.user.create({
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
  resolve: async (
    _,
    args: { id: string },
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    await context.fastify.prisma.user.delete({
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
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    return await context.fastify.prisma.user.update({
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
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    return await context.fastify.prisma.user.update({
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
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    await context.fastify.prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      },
    });
  },
};
