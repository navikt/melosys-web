import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import React from "react";

import Input from "./input";
import { reduxForm, Field } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

const TestForm = reduxForm({ form: "test" })(() => (
  <Field name="testField" component={Input} label="test" feltNavn="Test" navn="Test" />
));

describe("Input", () => {
  it("snapshot test", () => {
    const { container } = renderWithProviders(<TestForm />);
    expect(container).toMatchSnapshot();
  });

  it("viser ikke feilmelding", () => {
    const { queryByText } = renderWithProviders(<TestForm />);
    expect(queryByText("feilmelding")).not.toBeInTheDocument();
  });
});
