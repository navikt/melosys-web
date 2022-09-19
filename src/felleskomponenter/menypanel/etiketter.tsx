import React, { ComponentProps } from "react";

import * as Nav from "../../navFrontend";

import "./etiketter.css";

type NavEtikettBaseProps = ComponentProps<typeof Nav.EtikettBase>;
type EtikettProps = Omit<NavEtikettBaseProps, "type">;

const graa = "etikett__graa";

export const FraRegister = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="info">
    Fra register
  </Nav.EtikettBase>
);

export const FraBruker = (props: EtikettProps) => (
  <Nav.EtikettBase {...props} type="fokus">
    Fra bruker
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
  <Nav.EtikettBase {...props} type="info" className={graa}>
    Under 18 år
  </Nav.EtikettBase>
);
