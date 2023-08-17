import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import { Medlemskap } from "./medlemskap";
import MedlemskapTable from "./medlemskapTable";

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
    const medlemskap = shallow(<Medlemskap {...props} />);

    const medlemskapTable = medlemskap.find(MedlemskapTable);
    expect(medlemskapTable).toHaveLength(2);
    expect(medlemskapTable.first().props().perioder).toBe(props.medlemskap.perioderMed);
    expect(medlemskapTable.last().props().perioder).toBe(props.medlemskap.perioderUten);
  });

  it("viser infomelding dersom ingen perioder oppgitt", () => {
    props.medlemskap = {
      perioderMed: [],
      perioderUten: [],
      perioderUavklart: null,
    };
    const medlemskap = shallow(<Medlemskap {...props} />);
    const section = medlemskap.find("section");

    expect(section.children().first().text()).toBe("(ingen data funnet)");
  });
});
