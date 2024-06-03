import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import { useAsyncCallbackState } from "../../../../hooks";
import * as Api from "../../../../services/api";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";
import { Button, Dropdown, UNSAFE_Combobox } from "@navikt/ds-react";
import "./aarsavregning.css";
import * as Nav from "../../../../navFrontend";

export const VurderingAarsavregning = () => {
  const [lagretTrygdeavgift] = useAsyncCallbackState(
    () => Api.Aarsavregning.hentAvregningsData(1), // TODO bruk korrekt avregningsID
    undefined,
    []
  );

  const initialOptions = ["2023", "2022", "2021", "2020"];

  return (
    <div>
      <h1>Årsavregning</h1>

      <Nav.Column xs="1">
        {/* eslint-disable-next-line react/jsx-pascal-case */}
        <UNSAFE_Combobox label="Velg årstall" options={initialOptions} />
      </Nav.Column>
      <Nav.Column xs="12" className="tabeller">
        <Nav.Row>
          <Nav.Column xs="7">
            <MedlemskapsPerioderTabell
              perioder={lagretTrygdeavgift?.tidligereOpplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="4">
            <SkatteforholdsPerioderTabell
              perioder={lagretTrygdeavgift?.tidligereOpplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder}
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <TrygdeavgiftsperioderTabell
              perioder={lagretTrygdeavgift?.tidligereOpplysninger?.avgift.trygdeavgiftsperioder}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Column>
      <Nav.Row>
        <Nav.Column xs="12">
          <Button variant="primary">Bekreft og fortsett</Button>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};
