import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import { Utenlandsoppdraget } from "./utenlandsoppdraget";
import Soknadslandvelger from "./soknadslandvelger";

import MKV from "../../../../melosyskodeverk";

const { ARBEID_I_UTLANDET } = MKV.Koder.behandlinger.behandlingstema;

describe("Utenlandsoppdraget", () => {
  let mockedProps = mock<ComponentProps<typeof Utenlandsoppdraget>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    mockedProps = mock<ComponentProps<typeof Utenlandsoppdraget>>();
    props = instance(mockedProps);
  });

  it("viser ikke soknadslandvelger dersom behandlingstema tilhører FTRL", () => {
    props.behandlingstema = ARBEID_I_UTLANDET;

    const utenlandsoppdraget = shallow(<Utenlandsoppdraget {...props} />);

    const soknadslandvelger = utenlandsoppdraget.find(Soknadslandvelger);

    expect(soknadslandvelger).toHaveLength(0);
  });

  it("viser soknadslandvelger dersom behandlingstema ikke tilhører FTRL", () => {
    const utenlandsoppdraget = shallow(<Utenlandsoppdraget {...props} />);

    const soknadslandvelger = utenlandsoppdraget.find(Soknadslandvelger);

    expect(soknadslandvelger).toHaveLength(1);
  });
});
