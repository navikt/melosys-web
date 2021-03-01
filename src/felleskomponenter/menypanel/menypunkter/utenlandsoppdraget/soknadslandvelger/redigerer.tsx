import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Skjema from "../../../../skjema";

import MKV from "../../../../../melosyskodeverk";

const Redigerer = () => (
  <Skjema.MultiSelect
    label="Land"
    feltNavn="soknadsland"
    redigerbart
    options={MKV.KTObjects.landkoder.map(({ kode, term }: KTObject) => ({ value: kode, label: term }))}
  />
);

export default Redigerer;
