import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLObjectType, GraphQLSchema, graphql, parse, validate } from 'graphql';
import { memberTypeQuery, memberTypesQuery } from './memberTypes.js';
import {
  changeUserMutation,
  createUserMutation,
  deleteUserMutation,
  subscribeToMutation,
  unsubscribeFromMutation,
  userQuery,
  usersQuery,
} from './user.js';
import {
  changePostMutation,
  createPostMutation,
  deletePostMutation,
  postQuery,
  postsQuery,
} from './post.js';
import {
  changeProfileMutation,
  createProfileMutation,
  deleteProfileMutation,
  profileQuery,
  profilesQuery,
} from './profile.js';
import depthLimit from 'graphql-depth-limit';

const DEPTH_LIMIT = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {

      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            memberTypes: memberTypesQuery,
            memberType: memberTypeQuery,
            users: usersQuery,
            user: userQuery,
            posts: postsQuery,
            post: postQuery,
            profiles: profilesQuery,
            profile: profileQuery,
          },
        }),
        mutation: new GraphQLObjectType({
          name: 'mutation',
          fields: {
            createUser: createUserMutation,
            createPost: createPostMutation,
            createProfile: createProfileMutation,
            changeUser: changeUserMutation,
            changePost: changePostMutation,
            changeProfile: changeProfileMutation,
            deleteUser: deleteUserMutation,
            deletePost: deletePostMutation,
            deleteProfile: deleteProfileMutation,
            subscribeTo: subscribeToMutation,
            unsubscribeFrom: unsubscribeFromMutation,
          },
        }),
      });

      const errors = validate(schema, parse(req.body.query), [depthLimit(DEPTH_LIMIT)]);

      if (errors.length) {
        return {
          data: null,
          errors,
        };
      }

      const result = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: fastify,
      });

      return {
        data: result.data,
        errors: result.errors,
      };
    },
  });
};

export default plugin;
