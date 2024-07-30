import { reduxForm } from "redux-form";

import ArbeidsforholdNorgeListe from "./arbeidsforholdNorgeListe";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";

describe("ArbeidsforholdNorgeListe", () => {
  let props = null;
  const WrappedArbeidsforholdNorgeListe = reduxForm({ form: "test" })(ArbeidsforholdNorgeListe);

  beforeEach(() => {
    props = {
      leggTilTekst: "Legg til",
      slettTekst: "Sett",
      feltNavn: "feltnavn",
      redigerbart: true,
      hentOrganisasjon: vi.fn(),
      leggTil: vi.fn(),
      findOrganisasjon: vi.fn(),
      elementerInneholderOrg: vi.fn(),
      saksnummer: "13",
      tittelTekst: "tittel",
      tittelIkon: () => <span />,
    };
  });

  it("snapshot test", async () => {
    const { container, findByText } = renderWithProviders(<WrappedArbeidsforholdNorgeListe {...props} />);
    const user = userEvent.setup();
    await user.click(await findByText(props.leggTilTekst));

    expect(container).toMatchSnapshot();
  });
});
