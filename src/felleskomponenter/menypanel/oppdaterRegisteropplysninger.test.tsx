import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";
import OppdaterRegisteropplysninger from "./oppdaterRegisteropplysninger";

describe("Oppdater Registeropplysninger", () => {
  const mockedProps = mock<ComponentProps<typeof OppdaterRegisteropplysninger>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.oppdaterRegisteropplysninger = jest.fn();
  });

  it("rendres riktig", () => {
    props.sistOppdatert = "2020-08-23";

    const oppdaterRegisteropplysninger = shallow(<OppdaterRegisteropplysninger {...props} />);
    const spans = oppdaterRegisteropplysninger.find("span");

    expect(spans.at(0).text()).toBe("Oppdater registeropplysninger");
    expect(spans.at(1).text()).toBe(` (sist oppdatert ${props.sistOppdatert})`);
  });

  it("oppdaterer registeropplysninger når knapp klikkes", () => {
    const oppdaterRegisteropplysninger = shallow(<OppdaterRegisteropplysninger {...props} />);

    oppdaterRegisteropplysninger.find(".oppdater-registeropplysninger__oppdateringsknapp").simulate("click");

    expect(props.oppdaterRegisteropplysninger).toHaveBeenCalledTimes(1);
  });
});
