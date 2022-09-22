import { ApolloClient, InMemoryCache, createHttpLink, DefaultOptions } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { manifest } from '@/manifest';
import { auth } from '../firebase/app';

const httpLink = createHttpLink({
  uri:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080/graphql'
      : manifest.cloudRun.containers.lootboxServer.fullRoute,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log('graphQLErrors', graphQLErrors);
  }
  if (networkError) {
    console.log('networkError', networkError);
  }
});

const authLink = setContext(async (_, { headers }) => {
  let token: string | undefined;
  try {
    token = await auth.currentUser?.getIdToken(/* forceRefresh */ true);
  } catch (err) {
    token = undefined;
  }
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const client = new ApolloClient({
  link: authLink.concat(errorLink).concat(httpLink),
  cache: new InMemoryCache(),
  name: 'LootboxWidgets',
  version: '1.0',
  // defaultOptions: defaultOptions,
});

export default client;
