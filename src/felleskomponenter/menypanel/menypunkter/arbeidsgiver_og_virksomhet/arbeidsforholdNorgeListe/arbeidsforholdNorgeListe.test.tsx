import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { reduxForm } from "redux-form";

import ArbeidsforholdNorgeListe from "./arbeidsforholdNorgeListe";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

describe("ArbeidsforholdNorgeListe", () => {
  let props: any;
  const WrappedArbeidsforholdNorgeListe = reduxForm({ form: "test" })(ArbeidsforholdNorgeListe as any);

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
