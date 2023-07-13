import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";

import MKV from "../../melosyskodeverk";

import SemistrukturertAdresse, { PostnrStedLandLinje } from "./semistrukturertAdresse";
import { render, screen } from "@testing-library/react";

describe("SemistrukturertAdresse", () => {
  const mockedProps = mock<ComponentProps<typeof SemistrukturertAdresse>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser noen felter for semistrukturert adresse", () => {
    props.adresse = {
      adresselinje1: "Oslogata 1",
      adresselinje2: "Trondheimsgata 1",
      adresselinje3: "Bergensgata 1",
      adresselinje4: "Tromsøgata 1",
    };

    render(<SemistrukturertAdresse {...props} />);

    expect(screen.getByText("Oslogata 1")).toBeInTheDocument();
    expect(screen.getByText("Trondheimsgata 1")).toBeInTheDocument();
    expect(screen.getByText("Bergensgata 1")).toBeInTheDocument();
    expect(screen.getByText("Tromsøgata 1")).toBeInTheDocument();
  });

  it("viser ikke null- eller undefined-stringer dersom felter mangler", () => {
    props.adresse = {
      adresselinje1: null,
      adresselinje2: null,
      adresselinje3: null,
      adresselinje4: null,
    };

    render(<SemistrukturertAdresse {...props} />);
    expect(screen.queryByText("null")).not.toBeInTheDocument();
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });
});

describe("PostnrStedLandLinje", () => {
  it("viser riktig tekst", () => {
    const data = [
      [
        {
          postnummer: "1234",
          poststed: "Trondheim",
          land: undefined,
        },
        "1234 Trondheim",
      ],
      [
        {
          postnummer: null,
          poststed: null,
          land: MKV.Koder.landkoder.NO,
        },
        "NO",
      ],
      [
        {
          postnummer: "1234",
          poststed: null,
          land: MKV.Koder.landkoder.NO,
        },
        "1234, NO",
      ],
      [
        {
          postnummer: null,
          poststed: "Trondheim",
          land: MKV.Koder.landkoder.NO,
        },
        "Trondheim, NO",
      ],
      [
        {
          postnummer: "1234",
          poststed: "Trondheim",
          land: MKV.Koder.landkoder.NO,
        },
        "1234 Trondheim, NO",
      ],
    ];

    data.forEach((testdata) => {
      // @ts-ignore
      render(<PostnrStedLandLinje {...testdata[0]} />);
      // @ts-ignore
      expect(screen.getByText(testdata[1])).toBeInTheDocument();
    });
  });
});
