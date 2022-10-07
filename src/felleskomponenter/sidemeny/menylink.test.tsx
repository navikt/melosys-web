import React, { ComponentProps, MouseEvent } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import MenyLink from "./menylink";

describe("MenyLink", () => {
  const mockedProps = mock<ComponentProps<typeof MenyLink>>();
  const props = instance(mockedProps);

  it("kaller onClick ved klikk på button", () => {
    props.onClick = jest.fn();
    props.label = "test";

    const menyLink = shallow(<MenyLink {...props} />);
    const button = menyLink.find("button");
    const buttonOnClick = button.props().onClick;

    const mockedMouseEvent = mock<MouseEvent>();
    const mouseEvent = instance(mockedMouseEvent);
    if (buttonOnClick) buttonOnClick(mouseEvent);

    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});
