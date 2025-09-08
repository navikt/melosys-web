import { describe, it, expect, vi, beforeEach } from "vitest";

import { reduxForm } from "redux-form";

import EditerbartElementListe from "./editerbartElementListe";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("EditerbartElementListe", () => {
  let props: any;
  const WrappedEditerbartElementListe = reduxForm({ form: "test" })(EditerbartElementListe as any);

  beforeEach(() => {
    props = {
      feltNavn: "arbeidPaaLand",
      leggTilTekst: "Legg til",
      slettTekst: "Slett",
      redigerbart: true,
      fields: {
        getAll: vi.fn(() => [{}, {}]),
        name: "liste",
        remove: vi.fn(),
        push: vi.fn(),
      },
      elementClassName: "elementClassName",
      defaultElement: {},
      className: "className",
      settFeltVerdi: vi.fn(),
      hentNavn: vi.fn(() => "Navn"),
      tittelTekst: "tittel",
      redigererKomponent: () => <div>Element</div>,
      redigeringUtfortKomponent: () => <div>Element</div>,
      harData: () => true,
      tittelIkon: () => <div />,
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedEditerbartElementListe {...props} />);
    expect(container).toMatchSnapshot();
  });
});
