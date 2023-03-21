import React from "react";
import { Control } from "react-hook-form";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Nav from "../../../../../../navFrontend";
import { MedlemskapsperiodeProp } from "../vurderingPerioder";
import { PeriodeElement } from "./periodeElement";

export interface PeriodeElementerProps {
  redigerbart: boolean;
  trygdedekninger: KTObject[];
  innvilgelsesResultater: KTObject[];
  control: Control;
  medlemskapsperioder: MedlemskapsperiodeProp[];
  handleSlett: (index: number) => void;
  erPeriodeFoerSoknadMottatDato: (medlemskapsperiode: MedlemskapsperiodeProp) => boolean;
  handleEndreTomDato: (tomDato: string, index: number) => void;
}

export const PeriodeElementer = (props: PeriodeElementerProps) => {
  return (
    <Nav.Fieldset legend="Medlemskapsperiode(r)">
      <Nav.Row className="labelRad">
        <Nav.Column xs="2">
          <Nav.Typo.Element>Fra og med</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="2">
          <Nav.Typo.Element>Til og med</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Typo.Element>Trygdedekning</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="2">
          <Nav.Typo.Element>Resultat</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>

      {props.medlemskapsperioder?.map((medlemskapsperiode: MedlemskapsperiodeProp, index: number) => (
        <PeriodeElement index={index} key={medlemskapsperiode.id} {...props} />
      ))}
    </Nav.Fieldset>
  );
};
