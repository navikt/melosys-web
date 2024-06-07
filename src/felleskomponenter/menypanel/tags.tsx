import { Tag, TagProps as DsTagProps } from "@navikt/ds-react";

type TagProps = Omit<DsTagProps, "variant" | "children">;

export const FraRegister = (props: TagProps) => (
  <Tag {...props} variant="info" size="small">
    Fra register
  </Tag>
);

export const FraBruker = (props: TagProps) => (
  <Tag {...props} variant="warning" size="small">
    Fra bruker
  </Tag>
);

export const BrukersDel = (props: TagProps) => (
  <Tag {...props} variant="warning" size="small">
    Brukers del
  </Tag>
);

export const ArbeidstakersDel = (props: TagProps) => (
  <Tag {...props} variant="warning" size="small">
    Arbeidstakers del
  </Tag>
);

export const ArbeidsgiversDel = (props: TagProps) => (
  <Tag {...props} variant="warning" size="small">
    Arbeidsgivers del
  </Tag>
);

export const Under18Aar = (props: TagProps) => (
  <Tag {...props} variant="neutral" size="small">
    Under 18 år
  </Tag>
);
