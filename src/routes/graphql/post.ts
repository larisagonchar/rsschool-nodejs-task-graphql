import { FastifyInstance } from 'fastify';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from 'graphql';
import { UUIDType } from './types/uuid.js';

export const postType = new GraphQLObjectType({
  name: 'post',
  fields: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    title: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
    },
    authorId: {
      type: UUIDType,
    },
  },
});

export const postsQuery = {
  type: new GraphQLList(postType),
  resolve: async (_, __, context: FastifyInstance) => {
    return await context.prisma.post.findMany();
  },
};

export const postQuery = {
  type: postType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: FastifyInstance) => {
    return await context.prisma.post.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
});

interface createPostDtoModel {
  content: string;
  title: string;
  authorId: string;
}

export const createPostMutation = {
  type: postType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreatePostInput),
    },
  },
  resolve: async (_, args: { dto: createPostDtoModel }, context: FastifyInstance) => {
    return await context.prisma.post.create({
      data: args.dto,
    });
  },
};

export const deletePostMutation = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: FastifyInstance) => {
    await context.prisma.post.delete({
      where: {
        id: args.id,
      },
    });
  },
};

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    content: {
      type: GraphQLString,
    },
    title: {
      type: GraphQLString,
    },
    authorId: {
      type: UUIDType,
    },
  },
});

export const changePostMutation = {
  type: postType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(ChangePostInput),
    },
  },
  resolve: async (
    _,
    args: { id: string; dto: createPostDtoModel },
    context: FastifyInstance,
  ) => {
    return await context.prisma.post.update({
      where: {
        id: args.id,
      },
      data: args.dto,
    });
  },
};
