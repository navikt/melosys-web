import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";
import {
  BooleanFeltRedigeringUtfort,
  FormatertInntekt,
  InntektRedigeringUtfortUndertittel,
} from "./lonnOgGodtgjorelser";

describe("LonnOgGodtgjorelser", () => {
  describe("BooleanFeltRedigeringUtfort", () => {
    const mockedProps = mock<ComponentProps<typeof BooleanFeltRedigeringUtfort>>();
    let props = instance(mockedProps);

    beforeEach(() => {
      props = instance(mockedProps);
    });

    it('viser "Ja" dersom verdi er true', () => {
      props.verdi = true;
      const booleanFeltRedigeringUtfort = shallow(<BooleanFeltRedigeringUtfort {...props} />);
      expect(booleanFeltRedigeringUtfort.contains("Ja")).toBe(true);
    });

    it('viser "Nei" dersom verdi er false', () => {
      props.verdi = false;
      const booleanFeltRedigeringUtfort = shallow(<BooleanFeltRedigeringUtfort {...props} />);
      expect(booleanFeltRedigeringUtfort.contains("Nei")).toBe(true);
    });

    it('viser "-" dersom verdi er null', () => {
      props.verdi = null;
      const booleanFeltRedigeringUtfort = shallow(<BooleanFeltRedigeringUtfort {...props} />);
      expect(booleanFeltRedigeringUtfort.contains("-")).toBe(true);
    });
  });

  describe("InntektRedigeringUtfortUndertittel", () => {
    const mockedProps = mock<ComponentProps<typeof InntektRedigeringUtfortUndertittel>>();
    let props = instance(mockedProps);

    beforeEach(() => {
      props = instance(mockedProps);
    });

    it('viser "-" dersom verdi er tom streng', () => {
      props.verdi = "";
      const booleanFeltRedigeringUtfort = shallow(<InntektRedigeringUtfortUndertittel {...props} />);
      expect(booleanFeltRedigeringUtfort.contains("-")).toBe(true);
    });

    it('viser "-" dersom verdi er null', () => {
      props.verdi = null;
      const booleanFeltRedigeringUtfort = shallow(<InntektRedigeringUtfortUndertittel {...props} />);
      expect(booleanFeltRedigeringUtfort.contains("-")).toBe(true);
    });

    it("viser FormatertInntekt dersom verdi er 123", () => {
      props.verdi = 123;
      const booleanFeltRedigeringUtfort = shallow(<InntektRedigeringUtfortUndertittel {...props} />);
      expect(booleanFeltRedigeringUtfort.exists(FormatertInntekt)).toBe(true);
    });
  });
});
