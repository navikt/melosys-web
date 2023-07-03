import renderer from "react-test-renderer";
import * as uuid from "uuid";

import MKV from "../../../../melosyskodeverk";
import { VurderingVurderarbeidsland } from "./vurderingVurderarbeidsland";

jest.mock("uuid");
jest.mock("nav-frontend-js-utils", () => ({
  ...jest.requireActual("nav-frontend-js-utils"),
  guid: () => "123",
}));

describe("VurderingVurderarbeidsland", () => {
  let props = null;

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: jest.fn(),
      tilbake: jest.fn(),
      tilstand: {
        harAvklaring: true,
        sokkelEllerSkipListe: [],
        installasjonArbeidslandListe: [],
        installasjonArbeidslandTypeListe: [],
        arbeidslandListe: [],
        arbeidUtforesIOppgittLandFakta: undefined,
        fjernetArbeidslandFakta: [],
        harIngenMaritimeArbeidEllerHjemmebaser: false,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      maritimtArbeid: [
        {
          enhetNavn: "Dunfjæder",
          fartsomradeKode: "INNENRIKS",
          flaggLandkode: "GB",
          innretningLandkode: "GB",
          territorialfarvann: "GB",
          foretakNavn: "SWECO NORGE AS",
          foretakOrgnr: "967032271",
        },
      ],
      hjemmebaser: [MKV.Koder.landkoder.DE],
      soknadsland: [],
      arbeidsland: [],
      fjernedeArbeidsland: [],
      fjernedeSoknadsland: [],
    };
  });

  it("snapshot test", () => {
    jest.spyOn(uuid, "v4").mockReturnValue("321");
    const tree = renderer.create(<VurderingVurderarbeidsland {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
