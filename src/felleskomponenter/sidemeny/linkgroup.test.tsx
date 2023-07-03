import { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import LinkGroup from "./linkgroup";
import MenyLink from "./menylink";

describe("LinkGroup", () => {
  const mockedProps = mock<ComponentProps<typeof LinkGroup>>();
  const props = instance(mockedProps);

  it("viser Menylinker", () => {
    props.links = [
      {
        label: "Kaffe",
      },
      {
        label: "Te",
      },
    ];
    const linkGroup = shallow(<LinkGroup {...props} />);
    const menyLinks = linkGroup.find(MenyLink);

    expect(menyLinks).toHaveLength(2);
    expect(menyLinks.first().props().label).toBe("Kaffe");
    expect(menyLinks.last().props().label).toBe("Te");
  });
});
