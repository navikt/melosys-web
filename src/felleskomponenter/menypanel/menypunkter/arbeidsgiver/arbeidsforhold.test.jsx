import React from "react";

import Arbeidsforhold, { Arbeidsforholdet } from "./arbeidsforhold";

describe("arbeidsforhold", () => {
  let props = null;

  beforeEach(() => {
    props = {
      arbeidsforholdene: [
        {
          arbeidsforholdID: "1234",
        },
      ],
    };
  });

  it("lister ut arbeidsforhold", () => {
    const arbeidsforhold = shallow(<Arbeidsforhold {...props} />);
    const arbeidsforholdene = arbeidsforhold.find(Arbeidsforholdet);

    expect(arbeidsforholdene).toHaveLength(1);
    expect(arbeidsforholdene.first().props().arbeidsforholdet).toBe(props.arbeidsforholdene[0]);
  });
});

describe("arbeidsforholdet", () => {
  let props = null;

  beforeEach(() => {
    props = {
      arbeidsforholdet: {
        ansettelsesPeriode: {},
        arbeidsgiver: {
          navn: "NAV",
        },
      },
    };
  });

  it("vises uten å krasje", () => {
    shallow(<Arbeidsforholdet {...props} />);
  });
});
