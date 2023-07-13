import renderer from "react-test-renderer";
import * as uuid from "uuid";

import MKV from "../../../../melosyskodeverk";
import { VurderingVurderarbeidsland } from "./vurderingVurderarbeidsland";

vi.mock("uuid");

vi.mock("nav-frontend-js-utils", async () => {
  const actual = await vi.importActual("nav-frontend-js-utils");
  return {
    ...actual,
    guid: () => "123",
  };
});

// TODO: Skriv om når aksel tas inn i prosjektet.
describe.skip("VurderingVurderarbeidsland", () => {
  let props = null;

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
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
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
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
    vi.spyOn(uuid, "v4").mockReturnValue("321");
    const tree = renderer.create(<VurderingVurderarbeidsland {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
