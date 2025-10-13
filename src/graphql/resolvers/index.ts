/**
 * Combined GraphQL Resolvers
 * Aggregates all resolver modules for Apollo Server
 */

import { userQueries, userMutations, userFieldResolvers } from './userResolvers';
import { profileQueries, profileMutations, profileFieldResolvers } from './profileResolvers';
import { consentQueries, consentMutations } from './consentResolvers';
import { GraphQLScalarType, Kind } from 'graphql';

// ============================================================================
// CUSTOM SCALARS
// ============================================================================

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    return null;
  },
});

// ============================================================================
// COMBINED RESOLVERS
// ============================================================================

export const resolvers = {
  // Custom Scalars
  DateTime: DateTimeScalar,
  JSON: JSONScalar,

  // Queries
  Query: {
    ...userQueries,
    ...profileQueries,
    ...consentQueries,
  },

  // Mutations
  Mutation: {
    ...userMutations,
    ...profileMutations,
    ...consentMutations,
  },

  // Field Resolvers
  ...userFieldResolvers,
  ...profileFieldResolvers,
};
