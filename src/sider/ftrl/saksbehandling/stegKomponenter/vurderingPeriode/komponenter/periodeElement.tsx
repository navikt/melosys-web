import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../../../melosyskodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Forms from "../../../../../../felleskomponenter/forms";
import * as Ikoner from "../../../../../../resources/images";

import { PeriodeElementerProps } from "./periodeElementer";

type PeriodeElementProps = PeriodeElementerProps & {
  index: number;
};

export const PeriodeElement = ({
  index,
  redigerbart,
  trygdedekninger,
  innvilgelsesResultater,
  medlemskapsperioder,
  control,
  handleSlett,
  erPeriodeFoerSoknadMottatDato,
}: PeriodeElementProps) => {
  const skalDelvisInnvilgetVises =
    erPeriodeFoerSoknadMottatDato(medlemskapsperioder[index]) &&
    medlemskapsperioder[index].trygdedekning === MKV.Koder.trygdedekninger.PENSJONSDEL;

  const kanSlettePeriode = redigerbart && index === medlemskapsperioder.length - 1 && medlemskapsperioder.length !== 1;

  return (
    <>
      <Nav.Row>
        <Nav.Column xs="2">
          <Forms.Datovelger control={control} name={`medlemskapsperioder[${index}].fomDato`} disabled />
        </Nav.Column>
        <Nav.Column xs="2">
          <Forms.Datovelger control={control} name={`medlemskapsperioder[${index}].tomDato`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="4">
          <Forms.Select
            name={`medlemskapsperioder[${index}].trygdedekning`}
            control={control}
            disabled={!redigerbart}
            emptyFieldDisabled={!!medlemskapsperioder[index].trygdedekning}
          >
            {trygdedekninger.map((item: KTObject) => (
              <option key={item.kode} value={item.kode}>
                {item.term}
              </option>
            ))}
          </Forms.Select>
        </Nav.Column>
        <Nav.Column xs="2">
          <Forms.Select
            name={`medlemskapsperioder[${index}].innvilgelsesResultat`}
            control={control}
            disabled={!redigerbart}
            emptyFieldDisabled={!!medlemskapsperioder[index].innvilgelsesResultat}
          >
            {innvilgelsesResultater
              .filter((item: KTObject) =>
                skalDelvisInnvilgetVises ? true : item.kode !== MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET
              )
              .map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
          </Forms.Select>
        </Nav.Column>
        <Nav.Column xs="2">
          {kanSlettePeriode && (
            <Nav.Lenker className="slettKnapp" href="#" onClick={() => handleSlett(index)} title="Slett periode">
              <Ikoner.Bin />
              <span>Slett</span>
            </Nav.Lenker>
          )}
        </Nav.Column>
      </Nav.Row>
      {medlemskapsperioder[index].feil && (
        <Nav.AlertStripe type="feil" className="medlemskapsperiodeFeil">
          {medlemskapsperioder[index].feil}
        </Nav.AlertStripe>
      )}
    </>
  );
};
