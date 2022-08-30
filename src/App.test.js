import React from "react";
import { shallow } from "enzyme";
import { AuthProvider } from "react-oidc-context";
import { App } from "./App";

it("renders without crashing", () => {
  shallow(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
});
