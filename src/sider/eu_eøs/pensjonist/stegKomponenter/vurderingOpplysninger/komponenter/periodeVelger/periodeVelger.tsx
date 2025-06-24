import { Control } from "react-hook-form";
import * as Nav from "../../../../../../../navFrontend";
import * as Forms from "../../../../../../../felleskomponenter/forms";
import "./periodeVelger.css";
import MKV from "../../../../../../../melosyskodeverk";
import * as Utils from "../../../../../../../utils";
import { UkjentSluttdatoMedlemskapsperiode } from "../../../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/ukjentSluttdatoMedlemskapsperiode";
import { useSelector } from "react-redux";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../../../ducks/oppsummertfakta";
import { behandlingerSelectors } from "../../../../../../../ducks/behandlinger";
import { useDispatch } from "../../../../../../../hooks/useDispatch";

export interface PeriodeVelgerProps {
  redigerbart: boolean;
  control: Control;
  formValues: any;
  setValue: (name: string, value: any) => void;
  trigger: (name: string) => void;
}

export function PeriodeOgLandVelger({ redigerbart, control, formValues, setValue, trigger }: PeriodeVelgerProps) {
  const dispatch = useDispatch();
  const behandlingID: number = useSelector(behandlingerSelectors.BehandlingIDSelector);

  const ukjentSluttdatoMedlemskapsperiode = useSelector(
    oppsummertfaktaSelectors.UkjentSluttdatoMedlemskapsperiodeSelector,
  );

  console.log({ ukjentSluttdatoMedlemskapsperiode });

  const oppdaterSluttdato = async (ukjentSluttdato: boolean) => {
    if (ukjentSluttdato) {
      const fomISODate = Utils.dato.formatterDatoTilISO(formValues.fomDato, "");
      if (fomISODate) {
        const fomDate = new Date(fomISODate);
        const tomDate = new Date(fomDate);
        tomDate.setFullYear(tomDate.getFullYear() + 10);
        setValue("tomDato", Utils.dato.formatterDatoTilNorsk(tomDate.toISOString()));
      }

      trigger("tomDato");
    }

    dispatch(oppsummertfaktaOperations.lagreUkjentSluttdatoMedlemskapsperiode(behandlingID, ukjentSluttdato));
  };

  return (
    <div className="perioder">
      <Nav.Heading className="skjema_tittel" size="xsmall">
        Periode
      </Nav.Heading>

      <div className="skjema__panel">
        <Nav.Row className="skjema__panel__rad">
          <Nav.Column className="dato">
            <Forms.Datovelger
              label="Fra og med"
              control={control}
              name="fomDato"
              aria-label="Fra og med"
              readOnly={!redigerbart}
            />
          </Nav.Column>
          <Nav.Column className="dato">
            <Forms.Datovelger
              label="Til og med"
              minDate={Utils.dato.norskStringTilDate(formValues?.fomDato)}
              control={control}
              name="tomDato"
              aria-label="Til og med"
              readOnly={!redigerbart || ukjentSluttdatoMedlemskapsperiode}
            />
          </Nav.Column>
          <Nav.Column className="brederefelt">
            <Forms.Select label="Bostedsland" control={control} name="bostedLandkode" disabled={!redigerbart}>
              {MKV.KTObjects.landkoder.map((item: any) => (
                <option key={item.kode} value={item.kode} label={Utils.land.landTekstFormat(item)} />
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      </div>

      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={ukjentSluttdatoMedlemskapsperiode || false}
        onUkjentSluttdatoChange={oppdaterSluttdato}
        erEøsPensjonist={true}
      />
    </div>
  );
}
