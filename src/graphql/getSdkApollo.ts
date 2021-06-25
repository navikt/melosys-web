/* Hentet fra https://gist.github.com/akozhemiakin/731b0c1e99eb89b01f80f08f9146b6b6, med noen små endringer. */

/* eslint-disable */

import { ApolloClient, QueryOptions, MutationOptions } from "@apollo/client";
import { DocumentNode } from "graphql";

import { getSdk, Requester } from "./generated";
import ApolloRequestError from "./apolloRequestError";

export type ApolloRequesterOptions<V, R> =
  | Omit<QueryOptions<V>, "variables" | "query">
  | Omit<MutationOptions<R, V>, "variables" | "mutation">;

const validDocDefOps = ["mutation", "query", "subscription"];

export default function getSdkApollo<C>(client: ApolloClient<C>) {
  const requester: Requester = async <R, V>(
    doc: DocumentNode,
    variables: V,
    options?: ApolloRequesterOptions<V, R>
  ): Promise<R> => {
    // Valid document should contain *single* query or mutation unless it's has a fragment
    if (
      doc.definitions.filter((d) => d.kind === "OperationDefinition" && validDocDefOps.includes(d.operation)).length !==
      1
    ) {
      throw new Error("DocumentNode passed to Apollo Client must contain single query or mutation");
    }

    const definition = doc.definitions[0];

    // Valid document should contain *OperationDefinition*
    if (definition.kind !== "OperationDefinition") {
      throw new Error("DocumentNode passed to Apollo Client must contain single query or mutation");
    }

    switch (definition.operation) {
      case "mutation": {
        if (options?.fetchPolicy !== "no-cache" && options?.fetchPolicy !== undefined) {
          throw new Error(
            `No-cache is the only valid fetchpolicy for mutations, however provided fetchpolicy was ${options?.fetchPolicy}`
          );
        }

        const response = await client.mutate<R, V>({
          mutation: doc,
          variables,
          ...options,
          fetchPolicy: options?.fetchPolicy,
        });

        if (response.errors) {
          throw new ApolloRequestError(response.errors);
        }

        if (response.data === undefined || response.data === null) {
          throw new Error("No data presented in the GraphQL response");
        }

        return response.data;
      }
      case "query": {
        const response = await client.query<R, V>({
          query: doc,
          variables,
          ...options,
        });

        if (response.errors) {
          throw new ApolloRequestError(response.errors);
        }

        if (response.data === undefined || response.data === null) {
          throw new Error("No data presented in the GraphQL response");
        }

        return response.data;
      }
      case "subscription": {
        throw new Error("Subscription requests through SDK interface are not supported");
      }
    }
  };

  return getSdk(requester);
}

export type Sdk = ReturnType<typeof getSdkApollo>;
