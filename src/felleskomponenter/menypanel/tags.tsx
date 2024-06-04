import { Tag, TagProps } from "@navikt/ds-react";

export const FraRegister = (props: Omit<TagProps, "variant" | "children">) => (
  <Tag {...props} variant="info" size="small">
    Fra register
  </Tag>
);

export const FraBruker = (props: Omit<TagProps, "variant" | "children">) => (
  <Tag {...props} variant="warning" size="small">
    Fra bruker
  </Tag>
);

export const BrukersDel = (props: Omit<TagProps, "variant" | "children">) => (
  <Tag {...props} variant="warning" size="small">
    Brukers del
  </Tag>
);

export const ArbeidstakersDel = (props: Omit<TagProps, "variant" | "children">) => (
  <Tag {...props} variant="warning" size="small">
    Arbeidstakers del
  </Tag>
);

export const ArbeidsgiversDel = (props: Omit<TagProps, "variant" | "children">) => (
  <Tag {...props} variant="warning" size="small">
    Arbeidsgivers del
  </Tag>
);

export const Under18Aar = (props: Omit<TagProps, "variant" | "children">) => (
  <Tag {...props} variant="neutral" size="small">
    Under 18 år
  </Tag>
);
