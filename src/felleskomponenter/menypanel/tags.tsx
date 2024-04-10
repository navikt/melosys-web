import { ComponentProps } from "react";

import * as Nav from "../../navFrontend";

type NavTagBaseProps = ComponentProps<typeof Nav.Tag>;
type TagProps = Omit<NavTagBaseProps, "variant" | "children">;

export const FraRegister = (props: TagProps) => (
  <Nav.Tag {...props} variant="info" size="small">
    Fra register
  </Nav.Tag>
);

export const FraBruker = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning" size="small">
    Fra bruker
  </Nav.Tag>
);

export const BrukersDel = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning" size="small">
    Brukers del
  </Nav.Tag>
);

export const ArbeidstakersDel = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning" size="small">
    Arbeidstakers del
  </Nav.Tag>
);

export const ArbeidsgiversDel = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning" size="small">
    Arbeidsgivers del
  </Nav.Tag>
);

export const Under18Aar = (props: TagProps) => (
  <Nav.Tag {...props} variant="neutral" size="small">
    Under 18 år
  </Nav.Tag>
);
