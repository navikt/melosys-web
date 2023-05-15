import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";
import MKV from "../../../../melosyskodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import { Saksplukker } from "./saksplukker";
import * as featureToggleModule from "../../../../featuretoggle";

jest.mock("../../../../featuretoggle", () => ({
  __esModule: true,
  useFeatureToggle: jest.fn(),
}));

describe("Saksplukker", () => {
  beforeEach(() => {
    jest.spyOn(featureToggleModule, "useFeatureToggle").mockResolvedValue(true as never);
  });

  const mockedProps = mock<ComponentProps<typeof Saksplukker>>();
  const props = instance(mockedProps);

  it(`viser ikke behandlingstema ${MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND}`, () => {
    const behandling = shallow(<Saksplukker {...props} />);
    const select = behandling.find(Skjema.Select);
    const options = select.find("option");

    options.forEach((option) => {
      expect(option.props().value).not.toBe(MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND);
    });
  });
});
