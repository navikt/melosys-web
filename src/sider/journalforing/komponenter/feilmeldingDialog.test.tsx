import React, { ComponentProps } from "react";
import { shallow } from "enzyme";

import * as Nav from "../../../navFrontend";

import FeilmeldingDialog from "./feilmeldingDialog";

describe("FeilmeldingDialog", () => {
  let props: ComponentProps<typeof FeilmeldingDialog> = {
    avbryt: jest.fn(),
    feilmeldinger: [],
  };

  it("Viser en modal", () => {
    const feilmeldingDialog = shallow(<FeilmeldingDialog {...props} />);

    expect(feilmeldingDialog.find(Nav.Modal)).toHaveLength(1);
  });

  it("Viser en liste over feilmeldinger for feilmeldinger", () => {
    props.feilmeldinger = [
      { tittel: "tittel1", innhold: "innhold1" },
      { tittel: "tittel2", innhold: "innhold2" },
    ];

    const feilmeldingDialog = shallow(<FeilmeldingDialog {...props} />);
    const feilmeldinger = feilmeldingDialog.find("div.validering");

    expect(feilmeldinger).toHaveLength(2);
  });
});
