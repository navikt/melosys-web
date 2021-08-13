import { GraphQLError } from "graphql";

class ApolloRequestError extends Error {
  readonly errors: ReadonlyArray<GraphQLError>;

  constructor(errors: ReadonlyArray<GraphQLError>) {
    super(`One or more errors while performing GraphQL request:\n${errors.map((v) => `- ${v.message}`).join("\n")}`);

    this.errors = errors;
  }
}

export default ApolloRequestError;
