import SokkelSkipListe from "./sokkelskipliste";
import SokkelSkipEnkelt from "./sokkelskipenkelt";

describe("Sokkelskipliste", () => {
  let props = null;

  beforeEach(() => {
    props = {
      sokkelEllerSkipListe: [],
      installasjonArbeidslandListe: [],
      installasjonArbeidslandTypeListe: [],
      maritimtArbeid: [
        {
          enhetNavn: "Dunfjæder",
          fartsomradeKode: "INNENRIKS",
          flaggLandkode: "GB",
          innretningLandkode: "GB",
          territorialfarvann: "GB",
          foretakNavn: "SWECO NORGE AS",
          foretakOrgnr: "96703227",
        },
      ],
      begrunnelser: [
        {
          kode: "kode",
          term: "term",
        },
      ],
      redigerbart: true,
      avklartefaktaEndretHandler: vi.fn(),
      avklartefaktaBegrunnelserEndretHandler: vi.fn(),
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
    };
  });

  it("viser en liste over sokkelskip", () => {
    const sokkelskipliste = shallow(<SokkelSkipListe {...props} />);

    expect(sokkelskipliste.find(SokkelSkipEnkelt)).toHaveLength(1);
  });
});
