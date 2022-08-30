import React, { ComponentProps } from "react";
import { shallow } from "enzyme";

import EnkeltDato from "./enkeltDato";

describe("EnkeltDato", () => {
  const props: ComponentProps<typeof EnkeltDato> = {
    dato: "2016-12-31",
    visTidspunkt: true,
  };

  it("viser en dato med klokkeslett dersom dato er oppgitt og vistidspunkt er true", () => {
    const enkeltDato = shallow(<EnkeltDato {...props} />);
    const time = enkeltDato.find("time");

    expect(time).toHaveLength(1);
    expect(time.children().text()).toBe("31.12.2016 01:00");
  });

  it("viser en dato uten klokkeslett dersom dato er oppgitt og vistidspunkt er false", () => {
    props.visTidspunkt = false;
    const enkeltDato = shallow(<EnkeltDato {...props} />);
    const time = enkeltDato.find("time");

    expect(time).toHaveLength(1);
    expect(time.children().text()).toBe("31.12.2016");
  });

  it("viser bindestrek dersom dato ikke er oppgitt", () => {
    props.dato = undefined;
    const enkeltDato = shallow(<EnkeltDato {...props} />);

    expect(enkeltDato.children().text()).toBe("-");
  });
});
