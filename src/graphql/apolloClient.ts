import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { hentAuthorizationHeader } from "../services/utils";

const GRAPHQL_BASE_URL = `${process.env.REACT_APP_GRAPHQL_URL}`;

const httpLink = createHttpLink({
  uri: GRAPHQL_BASE_URL,
});

const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      ...hentAuthorizationHeader(),
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default apolloClient;
