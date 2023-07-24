import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLEnumType,
} from 'graphql';
import { MemberTypeId } from '../member-types/schemas.js';

export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {
      value: MemberTypeId.BASIC,
    },
    business: {
      value: MemberTypeId.BUSINESS,
    },
  },
});

export const memberType = new GraphQLObjectType({
  name: 'memberType',
  fields: {
    id: {
      type: MemberTypeIdEnum,
    },
    discount: {
      type: GraphQLFloat,
    },
    postsLimitPerMonth: {
      type: GraphQLInt,
    },
  },
});

export const memberTypesQuery = {
  type: new GraphQLList(memberType),
  resolve: async (
    _,
    __,
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    return await context.fastify.prisma.memberType.findMany();
  },
};

export const memberTypeQuery = {
  type: memberType,
  args: {
    id: {
      type: MemberTypeIdEnum,
    },
  },
  resolve: async (
    _,
    args: { id: MemberTypeId },
    context: {
      fastify: FastifyInstance;
    },
  ) => {
    return await context.fastify.prisma.memberType.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};
