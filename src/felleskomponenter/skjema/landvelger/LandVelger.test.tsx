import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import LandVelger from "./LandVelger";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../melosyskodeverk";
import { reduxForm } from "redux-form";

const WrappedLandVelger = reduxForm({ form: "test" })(LandVelger);

describe("Landvelger", () => {
  let props = null;
  let initialState = null;

  beforeEach(() => {
    props = {
      disabled: false,
      feltNavn: "test",
      label: "test",
      landkoder: undefined,
      dataTestId: "datalist",
    };
    initialState = {
      landkoder: {
        data: [
          { kode: "kode1", term: "term1" },
          { kode: "kode2", term: "term2" },
          { kode: "kode3", term: "term3" },
        ],
      },
      fagsaker: {
        data: {
          sakstype: {
            kode: MKV.Koder.sakstyper.TRYGDEAVTALE,
          },
        },
      },
    };
  });

  describe("Dersom visAlleLandkoder prop", () => {
    it("er true", () => {
      props.visAlleLandkoder = true;
      const { getAllByTestId } = renderWithProviders(<WrappedLandVelger {...props} />, {
        preloadedState: initialState,
      });

      const datalistOptions = getAllByTestId(props.dataTestId);
      expect(datalistOptions).toHaveLength(initialState.landkoder.data.length);
    });

    it("er undefined", () => {
      const { getAllByTestId } = renderWithProviders(<WrappedLandVelger {...props} />, {
        preloadedState: initialState,
      });

      const datalistOptions = getAllByTestId(props.dataTestId);
      expect(datalistOptions).toBeDefined();
      expect(datalistOptions).not.toHaveLength(initialState.landkoder.data.length);
    });
  });

  describe("Dersom landkoder prop", () => {
    it("er undefined", () => {
      const { getAllByTestId } = renderWithProviders(<WrappedLandVelger {...props} />, {
        preloadedState: initialState,
      });

      const datalistOptions = getAllByTestId(props.dataTestId);
      expect(datalistOptions).toBeDefined();
      expect(datalistOptions).not.toHaveLength(initialState.landkoder.data.length);
    });

    it("er satt til tom liste", () => {
      props.landkoder = [];
      const { queryAllByTestId } = renderWithProviders(<WrappedLandVelger {...props} />, {
        preloadedState: initialState,
      });

      const datalistOptions = queryAllByTestId(props.dataTestId);
      expect(datalistOptions).toBeDefined();
      expect(datalistOptions).toHaveLength(0);
    });

    it("er satt til en egendefinert liste", () => {
      props.landkoder = [{ kode: "egenKode", term: "egenTerm" }];
      const { getAllByTestId } = renderWithProviders(<WrappedLandVelger {...props} />, {
        preloadedState: initialState,
      });

      const datalistOptions = getAllByTestId(props.dataTestId);
      expect(datalistOptions).toBeDefined();
      expect(datalistOptions).toHaveLength(props.landkoder.length);
    });
  });
});
