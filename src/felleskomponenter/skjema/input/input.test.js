import React from "react";

import Input, { begrensAntallTegn, InnerInputComponent, normalizeDecimal, normalizeInt } from "./input";

describe("Input", () => {
  let props = null;

  beforeEach(() => {
    props = {
      bredde: "M",
      feltNavn: "",
    };
  });

  it("viser en redux form Field komponent", () => {
    const input = shallow(<Input {...props} />);

    expect(input.find("Field")).toHaveLength(1);
  });

  it("sender bredde prop korrekt", () => {
    props.bredde = "test";
    const input = shallow(<Input {...props} />);

    expect(input.props().bredde).toBe(props.bredde);
  });
  it("sender feltNavn prop korrekt", () => {
    props.feltNavn = "test";
    const input = shallow(<Input {...props} />);

    expect(input.props().name).toBe(props.feltNavn);
  });

  it("sender normalizer prop korrekt", () => {
    props.normalize = () => "test";
    const input = shallow(<Input {...props} />);

    expect(input.props().normalize).toBe(props.normalize);
  });
});

describe("normalizeDecimal", () => {
  it("returnerer null for tom string", () => {
    expect(normalizeDecimal("", "5")).toBe(null);
  });

  it("erstatter komma med punktum", () => {
    expect(normalizeDecimal("5,", "5")).toBe("5.");
  });

  it("returnerer value hvis value er desimal", () => {
    expect(normalizeDecimal("5.", "5")).toBe("5.");
  });

  it("returnerer value hvis value er heltall", () => {
    expect(normalizeDecimal("5", null)).toBe("5");
  });

  it("returnerer previousvalue hvis value ikke er heltall eller desimal", () => {
    expect(normalizeDecimal("5..", null)).toBe(null);
    expect(normalizeDecimal(".", null)).toBe(null);
    expect(normalizeDecimal(".5", null)).toBe(null);
  });
});

describe("normalizeInt", () => {
  it("returnerer null for tom string", () => {
    expect(normalizeInt("", "5")).toBe(null);
  });

  it("returnerer previousValue hvis value er desimal", () => {
    expect(normalizeInt("5.", "5")).toBe("5");
  });

  it("returnerer value hvis value er heltall", () => {
    expect(normalizeInt("5", null)).toBe("5");
  });
});

describe("begrensAntallTegn", () => {
  it("returnerer begrenset antall tegn", () => {
    expect(begrensAntallTegn(5)("12345678911")).toBe("12345");
  });

  it("begrenser ikke dersom antallet tegn ikke er nådd maksimum", () => {
    expect(begrensAntallTegn(10)("Heihei")).toBe("Heihei");
  });

  it("begrenser ikke dersom antallet tegn er like mange som maksimalt tillatte tegn", () => {
    expect(begrensAntallTegn(18)("her har vi 18 tegn")).toBe("her har vi 18 tegn");
  });
});

describe("InnerInputComponent", () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: "",
      bredde: "M",
      meta: {
        error: "",
        touched: false,
        active: true,
      },
      input: {},
    };
  });

  it("viser en Nav Input", () => {
    const innerInputComponent = shallow(<InnerInputComponent {...props} />);

    expect(innerInputComponent.find("Input")).toHaveLength(1);
  });

  it("sender label prop korrekt", () => {
    props.label = "testlabel";
    const innerInputComponent = shallow(<InnerInputComponent {...props} />);

    expect(innerInputComponent.find("Input").props().label).toBe(props.label);
  });

  describe("viser feilmelding", () => {
    it("dersom meta.error inneholder feilmelding, meta.touched er true og meta.activ er false", () => {
      props.meta = {
        error: "feilmelding",
        touched: true,
        active: false,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find("Input").props().feil.feilmelding).toBe(props.meta.error);
    });
  });

  describe("viser ikke feilmelding", () => {
    it("dersom meta.error ikke inneholder feilmelding", () => {
      props.meta = {
        error: "",
        touched: true,
        active: false,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find("Input").props().feil).toBeUndefined();
    });

    it("dersom meta.touched er false", () => {
      props.meta = {
        error: "feilmelding",
        touched: false,
        active: false,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find("Input").props().feil).toBeUndefined();
    });

    it("dersom meta.active er true", () => {
      props.meta = {
        error: "feilmelding",
        touched: true,
        active: true,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find("Input").props().feil).toBeUndefined();
    });
  });
});
