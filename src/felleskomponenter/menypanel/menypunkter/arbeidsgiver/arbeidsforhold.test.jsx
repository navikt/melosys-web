import renderer from "react-test-renderer";

import Arbeidsforhold from "./arbeidsforhold";

vi.mock("../../../../utils", async () => {
  const actual = await vi.importActual("../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("arbeidsforhold", () => {
  const props = {
    arbeidsforholdene: [
      {
        arbeidsforholdID: "1234",
        ansettelsesPeriode: {
          fom: "2023-06-26",
          tom: "2023-08-01",
        },
        arbeidsgiver: {
          navn: "NAV",
          orgnr: "123",
        },
      },
    ],
  };

  it("snapshot test", () => {
    const tree = renderer.create(<Arbeidsforhold {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
