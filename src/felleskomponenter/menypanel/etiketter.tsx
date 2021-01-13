import React, { ComponentProps } from "react";

import * as Nav from "../../utils/navFrontend";

type NavEtikettBaseProps = ComponentProps<typeof Nav.EtikettBase>;
type EtikettProps = Omit<NavEtikettBaseProps, "type">;

export const FraRegister = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="info">
    Fra register
  </Nav.EtikettBase>
);

export const FraSoknad = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="fokus">
    Fra søknad
  </Nav.EtikettBase>
);

export const FraSed = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="fokus">
    Fra SED
  </Nav.EtikettBase>
);

export const ArbeidstakersDel = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="fokus">
    Arbeidstakers del
  </Nav.EtikettBase>
);

export const ArbeidsgiversDel = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="fokus">
    Arbeidsgivers del
  </Nav.EtikettBase>
);

export const Under18Aar = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="info">
    Under 18 år
  </Nav.EtikettBase>
);
