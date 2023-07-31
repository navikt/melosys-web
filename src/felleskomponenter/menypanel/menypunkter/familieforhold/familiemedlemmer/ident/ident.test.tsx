import { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import KopierbarTekst from "../../../../../kopierbarTekst";
import Ident from "./ident";

describe("Ident", () => {
  const mockedProps = mock<ComponentProps<typeof Ident>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser kopierbar ident", () => {
    props.ident = "fødselsnummer";

    const ident = shallow(<Ident {...props} />);

    expect(ident.find(KopierbarTekst).children().text()).toContain("fødselsnummer");
  });
});
