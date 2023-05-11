import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import FeatureToggle from "./featureToggle";

describe("FeatureToggle", () => {
  const mockedProps = mock<ComponentProps<typeof FeatureToggle>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("vises uten å krasje", async () => {
    props.children = jest.fn();
    shallow(<FeatureToggle {...props} />);

    expect(props.children).toHaveBeenCalledTimes(1);
    expect(props.children).toHaveBeenLastCalledWith(undefined);
  });
});
