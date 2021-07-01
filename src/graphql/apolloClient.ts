import { ApolloClient, InMemoryCache } from "@apollo/client";

const GRAPHQL_BASE_URL = `${process.env.REACT_APP_GRAPHQL_URL}`;

const apolloClient = new ApolloClient({
  uri: GRAPHQL_BASE_URL,
  cache: new InMemoryCache(),
});

export default apolloClient;
