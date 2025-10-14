/**
 * ============================================================================
 * Apollo Provider Component
 * ============================================================================
 *
 * Wraps the application with Apollo Client provider for GraphQL operations.
 * Provides Apollo Client context to all child components.
 * Enables use of Apollo hooks like useQuery, useMutation, etc.
 */

import React, { ReactNode } from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { apolloClient } from './apollo';

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>;
};

export default ApolloProvider;
