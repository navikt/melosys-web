import Organisasjon from "./organisasjon";
import OrganisasjonsAdresse from "../../../adresser/organisasjonsAdresse";

describe("organisasjon", () => {
  let props = null;

  beforeEach(() => {
    props = {
      organisasjon: {},
      redigerbart: true,
    };
  });

  it("viser organisasjonsadresse", () => {
    const organisasjon = shallow(<Organisasjon {...props} />);
    const organisasjonsAdresse = organisasjon.find(OrganisasjonsAdresse);

    expect(organisasjonsAdresse).toHaveLength(1);
    expect(organisasjonsAdresse.props().organisasjon).toBe(props.organisasjon);
  });
});
