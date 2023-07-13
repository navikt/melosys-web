import { FieldArray } from "redux-form";

import ArbeidsforholdNorgeListe, {
  InnerArbeidsforholdNorgeListe,
  EnkeltArbeidsforholdNorgeRedigerer,
  EnkeltArbeidsforholdNorge,
} from "./arbeidsforholdNorgeListe";
import Orgnrinput from "./orgnrinput";
import Organisasjon from "../../arbeidsgiver/organisasjon";

describe("ArbeidsforholdNorgeListe", () => {
  let props = null;

  beforeEach(() => {
    props = {
      leggTilTekst: "Legg til",
      slettTekst: "Sett",
      feltNavn: "feltnavn",
      redigerbart: true,
      hentOrganisasjon: vi.fn(),
      leggTil: vi.fn(),
      findOrganisasjon: vi.fn(),
    };
  });

  it("Viser en FieldArray med InnerArbeidsforholdNorgeListe", () => {
    const arbeidsforholdNorgeListe = shallow(<ArbeidsforholdNorgeListe {...props} />);
    const fieldArray = arbeidsforholdNorgeListe.find(FieldArray);
    const fieldArrayProps = fieldArray.props();

    expect(fieldArray).toHaveLength(1);
    expect(fieldArrayProps.component).toBe(InnerArbeidsforholdNorgeListe);
  });
});

describe("InnerArbeidsforholdNorgeListe", () => {
  let props = null;

  beforeEach(() => {
    props = {
      leggTilTekst: "Legg til",
      tittelTekst: "tittel",
      tittelIkon: () => <span />,
      fields: {
        getAll: vi.fn(() => ["123123123"]),
      },
      redigerbart: true,
      hentOrganisasjon: vi.fn(),
      leggTil: vi.fn(),
      findOrganisasjon: vi.fn(() => ({ orgnr: "123123123" })),
      transformerOrgTilElement: vi.fn(),
      defaultElement: {},
      elementerInneholderOrg: vi.fn(),
      saksnummer: "13",
    };
  });

  it("viser et EnkeltArbeidsforholdNorge", () => {
    const innerArbeidsforholdNorgeListe = shallow(<InnerArbeidsforholdNorgeListe {...props} />);
    const enkeltArbeidsforholdNorge = innerArbeidsforholdNorgeListe.find(EnkeltArbeidsforholdNorge);

    expect(enkeltArbeidsforholdNorge).toHaveLength(1);
  });
});

describe("EnkeltArbeidsforholdNorgeRedigerer", () => {
  let props = null;

  beforeEach(() => {
    props = {
      erstatt: vi.fn(),
      valideringer: [],
      redigerbart: true,
      hentOrganisasjon: vi.fn(),
      organisasjon: { orgnr: "123123123" },
      slett: vi.fn(),
      slettTekst: "Slett",
      kontaktopplysninger: {},
      onKontaktopplysningerChange: vi.fn(),
      onKontaktopplysningerInputBlur: vi.fn(),
      onKontaktopplysningerSlettClick: vi.fn(),
    };
  });

  it("viser en Organisasjon", () => {
    const enkeltArbeidsforholdNorgeRedigerer = shallow(<EnkeltArbeidsforholdNorgeRedigerer {...props} />);
    const organisasjon = enkeltArbeidsforholdNorgeRedigerer.find(Organisasjon);
    const organisasjonProps = organisasjon.props();

    expect(organisasjon).toHaveLength(1);
    expect(organisasjonProps.organisasjon).toEqual({ orgnr: "123123123" });
    expect(organisasjonProps.redigerbart).toBe(props.redigerbart);
  });

  it("viser en orgnrinput", () => {
    const enkeltArbeidsforholdNorgeRedigerer = shallow(<EnkeltArbeidsforholdNorgeRedigerer {...props} />);
    const orgnrinput = enkeltArbeidsforholdNorgeRedigerer.find(Orgnrinput);

    expect(orgnrinput).toHaveLength(1);
  });
});
