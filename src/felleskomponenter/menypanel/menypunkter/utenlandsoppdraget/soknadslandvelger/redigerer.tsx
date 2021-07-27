import React from "react";
import { FormSection } from "redux-form";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Skjema from "../../../../skjema";
import * as Nav from "../../../../../utils/navFrontend";

import MKV from "../../../../../melosyskodeverk";

const Redigerer = () => (
  <FormSection name="soknadsland">
    <Skjema.MultiSelect
      label={<Nav.Typo.Normaltekst>Land</Nav.Typo.Normaltekst>}
      feltNavn="landkoder"
      redigerbart
      options={MKV.KTObjects.landkoder.map(({ kode, term }: KTObject) => ({ value: kode, label: term }))}
    />
  </FormSection>
);

export default Redigerer;
