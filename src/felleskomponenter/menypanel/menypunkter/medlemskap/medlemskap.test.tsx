import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { render, screen } from "@testing-library/react";

import { Medlemskap } from "./medlemskap";

const periode = {
  periodeID: 1,
  periode: {
    fom: "2022-01-01",
    tom: "2022-02-02",
  },
  periodetype: null,
  status: null,
  grunnlagstype: null,
  land: {
    kode: "NO",
    term: "Norge",
  },
  lovvalg: {
    kode: "L",
    term: "l",
  },
  trygdedekning: {
    kode: "T",
    term: "t",
  },
  kildedokumenttype: {
    kode: "K",
    term: "k",
  },
  kilde: {
    kode: "KI",
    term: "ki",
  },
};

describe("Medlemskap", () => {
  const mockedProps = mock<ComponentProps<typeof Medlemskap>>();
  const props = instance(mockedProps);

  beforeEach(() => {
    props.medlemskap = {
      perioderMed: [periode],
      perioderUten: [periode],
      perioderUavklart: null,
    };
  });

  it("Viser tabell med perioder for medlemskap", () => {
    render(<Medlemskap {...props} />);

    expect(screen.getByText("Perioder med medlemskap")).toBeInTheDocument();
    expect(screen.getByText("Perioder uten medlemskap")).toBeInTheDocument();
    expect(screen.queryByText("(ingen data funnet)")).not.toBeInTheDocument();
  });

  it("viser infomelding dersom ingen perioder oppgitt", () => {
    props.medlemskap = {
      perioderMed: [],
      perioderUten: [],
      perioderUavklart: null,
    };
    render(<Medlemskap {...props} />);
    const noDataFoundElements = screen.getAllByText("(ingen data funnet)");
    expect(noDataFoundElements.length).toBe(2);
    expect(screen.getAllByText("Perioder med medlemskap")).toHaveLength(1);
    expect(screen.getAllByText("Perioder uten medlemskap")).toHaveLength(1);
  });
});
