import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import PeriodeForkorter from "./index";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

const WrappedPeriodeForkorter = reduxForm({ form: "test" })(PeriodeForkorter);

describe("PeriodeForkorter", () => {
  let props = null;

  beforeEach(() => {
    props = {
      checkboxClassName: "classname",
      redigerbart: true,
      checkboxFeltnavn: "forkortlovvalgsperiode",
      forkortPeriode: true,
      checkboxLabel: "Forkort lovvalgsperiode",
      onUncheck: vi.fn(),
      fomLabel: "Fra og med",
      fomFeltNavn: "fom",
      tomLabel: "Til og med",
      tomFeltNavn: "tom",
      fomRedigerbar: true,
    };
  });

  it("viser felter for å forkorte periode dersom forkortPeriode prop er true", () => {
    const { getByLabelText } = renderWithProviders(<WrappedPeriodeForkorter {...props} />);

    const fomInput = getByLabelText(props.fomLabel);
    const tomInput = getByLabelText(props.tomLabel);
    expect(fomInput).toBeInTheDocument();
    expect(fomInput).not.toHaveAttribute("readonly");
    expect(tomInput).toBeInTheDocument();
    expect(tomInput).not.toHaveAttribute("readonly");
  });

  it("viser ikke felter for å forkorte periode dersom forkortPeriode prop er false", () => {
    props.forkortPeriode = false;

    const { queryByLabelText } = renderWithProviders(<WrappedPeriodeForkorter {...props} />);

    expect(queryByLabelText(props.fomLabel)).not.toBeInTheDocument();
    expect(queryByLabelText(props.tomLabel)).not.toBeInTheDocument();
  });

  it("fomRedigerbar kan disable fom", () => {
    props.fomRedigerbar = false;

    const { getByLabelText } = renderWithProviders(<WrappedPeriodeForkorter {...props} />);

    const fomInput = getByLabelText(props.fomLabel);
    const tomInput = getByLabelText(props.tomLabel);
    expect(fomInput).toBeInTheDocument();
    expect(fomInput).toHaveAttribute("readonly");
    expect(tomInput).toBeInTheDocument();
    expect(tomInput).not.toHaveAttribute("readonly");
  });
});
