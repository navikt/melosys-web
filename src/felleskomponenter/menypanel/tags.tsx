import { TagProps as DsTagProps } from "@navikt/ds-react";
import * as Nav from "../../navFrontend";

type TagProps = Omit<DsTagProps, "variant" | "children">;

export function FraRegister(props: TagProps) {
  return (
    <Nav.Tag {...props} variant="info">
      Fra register
    </Nav.Tag>
  );
}

export function FraBruker(props: TagProps) {
  return (
    <Nav.Tag {...props} variant="warning">
      Fra bruker
    </Nav.Tag>
  );
}

export function BrukersDel(props: TagProps) {
  return (
    <Nav.Tag {...props} variant="warning">
      Brukers del
    </Nav.Tag>
  );
}

export function ArbeidstakersDel(props: TagProps) {
  return (
    <Nav.Tag {...props} variant="warning">
      Arbeidstakers del
    </Nav.Tag>
  );
}

export function ArbeidsgiversDel(props: TagProps) {
  return (
    <Nav.Tag {...props} variant="warning">
      Arbeidsgivers del
    </Nav.Tag>
  );
}

export function Under18Aar(props: TagProps) {
  return (
    <Nav.Tag {...props} variant="neutral">
      Under 18 år
    </Nav.Tag>
  );
}
