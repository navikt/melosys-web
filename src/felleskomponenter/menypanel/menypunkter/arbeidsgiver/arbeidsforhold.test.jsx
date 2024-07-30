import Arbeidsforhold from "./arbeidsforhold";
import { render } from "@testing-library/react";

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
    const { container } = render(<Arbeidsforhold {...props} />);

    expect(container).toMatchSnapshot();
  });
});
