import { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import SideMeny from "./sidemeny";
import LinkGroup from "./linkgroup";

describe("SideMeny", () => {
  const mockedProps = mock<ComponentProps<typeof SideMeny>>();
  const props = instance(mockedProps);

  it("viser linkgroups", () => {
    props.linkGroups = [
      {
        label: "Sukker",
        links: [
          {
            label: "Hvitt sukker",
          },
        ],
      },
      {
        label: "Salt",
        links: [
          {
            label: "Bordsalt",
          },
        ],
      },
    ];
    const sideMeny = shallow(<SideMeny {...props} />);
    const linkGroup = sideMeny.find(LinkGroup);

    expect(linkGroup).toHaveLength(2);
    expect(linkGroup.first().props().label).toBe("Sukker");
    expect(linkGroup.first().props().links).toHaveLength(1);
    expect(linkGroup.first().props().links[0].label).toBe("Hvitt sukker");
    expect(linkGroup.last().props().label).toBe("Salt");
    expect(linkGroup.last().props().links).toHaveLength(1);
    expect(linkGroup.last().props().links[0].label).toBe("Bordsalt");
  });
});
