import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const GRAPHQL_BASE_URL = `${window.env.GRAPHQL_URL}`;

const httpLink = createHttpLink({
  uri: GRAPHQL_BASE_URL,
});

const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      // Delspørringene mangler objekt-ID-er og må flettes uten å overskrive hverandre.
      // Overlappende lister må hente samme felter, siden listeverdier fortsatt erstattes.
      Saksopplysninger: { merge: true },
      Personopplysninger: { merge: true },
    },
  }),
});

export default apolloClient;
