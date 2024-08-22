import { TagProps as DsTagProps } from "@navikt/ds-react";
import * as Nav from "../../navFrontend";

type TagProps = Omit<DsTagProps, "variant" | "children">;

export const FraRegister = (props: TagProps) => (
  <Nav.Tag {...props} variant="info">
    Fra register
  </Nav.Tag>
);

export const FraBruker = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning">
    Fra bruker
  </Nav.Tag>
);

export const BrukersDel = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning">
    Brukers del
  </Nav.Tag>
);

export const ArbeidstakersDel = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning">
    Arbeidstakers del
  </Nav.Tag>
);

export const ArbeidsgiversDel = (props: TagProps) => (
  <Nav.Tag {...props} variant="warning">
    Arbeidsgivers del
  </Nav.Tag>
);

export const Under18Aar = (props: TagProps) => (
  <Nav.Tag {...props} variant="neutral">
    Under 18 år
  </Nav.Tag>
);
