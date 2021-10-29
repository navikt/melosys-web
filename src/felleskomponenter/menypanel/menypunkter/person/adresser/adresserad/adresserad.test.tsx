import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Nav from "../../../../../../navFrontend";

import Adresserad from "./adresserad";

describe("Adresserad", () => {
  const mockedProps = mock<ComponentProps<typeof Adresserad>>();
  const props = instance(mockedProps);

  it("viser flere kolonner", () => {
    props.kolonner = [
      {
        innhold: <div />,
        bredde: "1",
      },
      {
        innhold: <span />,
        bredde: "11",
      },
    ];

    const adresserad = shallow(<Adresserad {...props} />);

    // find<Nav.Column>() i stedet for bare find() fordi vscode klagde på at forsteKolonne hadde unknown type.
    const forsteKolonne = adresserad.find<Nav.Column>(Nav.Column).first();
    const sisteKolonne = adresserad.find<Nav.Column>(Nav.Column).last();

    expect(forsteKolonne.props().xs).toBe("1");
    expect(forsteKolonne.children().type()).toBe("div");
    expect(sisteKolonne.props().xs).toBe("11");
    expect(sisteKolonne.children().type()).toBe("span");
  });
});
