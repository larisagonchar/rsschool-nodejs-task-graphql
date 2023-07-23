import { FastifyInstance } from 'fastify';
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
} from 'graphql';
import { MemberTypeIdEnum, memberType } from './memberTypes.js';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';

export const profileType = new GraphQLObjectType({
  name: 'profile',
  fields: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
    userId: {
      type: UUIDType,
    },
    memberTypeId: {
      type: MemberTypeIdEnum,
    },
    memberType: {
      type: memberType,
      resolve: async (
        parent: { memberTypeId: string },
        args: { id: string },
        context: FastifyInstance,
      ) => {
        return await context.prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId,
          },
        });
      },
    },
  },
});

export const profilesQuery = {
  type: new GraphQLList(profileType),
  resolve: async (_, __, context: FastifyInstance) => {
    return await context.prisma.profile.findMany();
  },
};

export const profileQuery = {
  type: profileType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: FastifyInstance) => {
    return await context.prisma.profile.findUnique({
      where: {
        id: args.id,
      },
    });
  },
};

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    memberTypeId: {
      type: new GraphQLNonNull(MemberTypeIdEnum),
    },
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
});

interface createProfileDtoModel {
  userId: string;
  memberTypeId: MemberTypeId;
  isMale: boolean;
  yearOfBirth: number;
}

export const createProfileMutation = {
  type: profileType,
  args: {
    dto: {
      type: CreateProfileInput,
    },
  },
  resolve: async (_, args: { dto: createProfileDtoModel }, context: FastifyInstance) => {
    return await context.prisma.profile.create({
      data: args.dto,
    });
  },
};

export const deleteProfileMutation = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (_, args: { id: string }, context: FastifyInstance) => {
    await context.prisma.profile.delete({
      where: {
        id: args.id,
      },
    });
  },
};

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: {
      type: GraphQLBoolean,
    },
    memberTypeId: {
      type: MemberTypeIdEnum,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
  },
});

export const changeProfileMutation = {
  type: profileType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(ChangeProfileInput),
    },
  },
  resolve: async (
    _,
    args: { id: string; dto: createProfileDtoModel },
    context: FastifyInstance,
  ) => {
    return await context.prisma.profile.update({
      where: {
        id: args.id,
      },
      data: args.dto,
    });
  },
};
