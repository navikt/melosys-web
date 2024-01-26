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

  it("Viser to medlemskapsgrupper", () => {
    render(<Medlemskap {...props} />);

    const medlemskapTable = screen.getAllByRole("table");
    expect(medlemskapTable).toHaveLength(2);
    expect(medlemskapTable[0]).toHaveTextContent(props.medlemskap.perioderMed.periode.fom);
    //expect(medlemskapTable[1]).toHaveTextContent(props.medlemskap.perioderMed.periode.fom);
  });

  it("viser infomelding dersom ingen perioder oppgitt", () => {
    props.medlemskap = {
      perioderMed: [],
      perioderUten: [],
      perioderUavklart: null,
    };
    render(<Medlemskap {...props} />);
    const noDataMessages = screen.getAllByText("(ingen data funnet)");
    expect(noDataMessages).toHaveLength(2);
  });
});
