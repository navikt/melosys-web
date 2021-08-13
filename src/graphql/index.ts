import apolloClient from "./apolloClient";
import getSdkApollo from "./getSdkApollo";

const ApolloSDK = getSdkApollo(apolloClient);

export { ApolloSDK, apolloClient };

export * from "./generated";
