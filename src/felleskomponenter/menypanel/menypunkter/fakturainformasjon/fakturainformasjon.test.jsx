import Fakturainformasjon from "./fakturainformasjon";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../../utils", async () => {
  const actual = await vi.importActual("../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

const props = {
  redigerbart: true,
  behandlingstype: "MANGLENDE_INNBETALING_TRYGDEAVGIFT",
};

const initialState = () => ({
  behandlinger: {
    status: "",
    data: {
      redigerbart: props.redigerbart,
      oppsummering: {
        behandlingstema: {
          kode: props.behandlingstema,
        },
        behandlingstype: {
          kode: props.behandlingstype,
        },
      },
    },
  },
  fakturainformasjon: {
    status: "OK",
    data: [
      {
        faktura: [],
        fakturaGjelder: "NAV",
        fodselsnummer: "12345612345",
        intervall: "MANEDLIG",
        referanseBruker: "Ref. bruker",
        referanseNAV: "Ref. NAV",
        sluttdato: "20.07.2023",
        startdato: "01.06.2023",
        status: "UNDER_BEHANDLING",
        vedtaksId: "MEL-123-56",
      },
    ],
  },
});

describe("Fakturainformasjon", () => {
  it("snapshot test", () => {
    const { container } = renderWithProviders(<Fakturainformasjon />, { preloadedState: initialState() });
    expect(container).toMatchSnapshot();
  });
});
