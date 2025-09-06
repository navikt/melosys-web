import { Control, FieldArrayWithId, UseFormWatch } from "react-hook-form";
import * as Forms from "../../../../../../felleskomponenter/forms";
import * as Ikoner from "../../../../../../resources/images";
import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../../felleskomponenter/ui";

import { FieldArrayProps, MedlemskapsperiodeProp } from "./types";
import "./medlemskapsperioder.less";
import * as KV from "../../../../../../kodeverk";
import MKV from "../../../../../../melosyskodeverk";
import { useSelector } from "react-redux";
import { medlemskapsperioderSelectors } from "../../../../../../ducks/medlemskapsperioder";
import useFeatureToggle from "../../../../../../featuretoggle/useFeatureToggle";
import { MELOSYS_PENSJONIST } from "../../../../../../featuretoggle/toggleNavn";
import { behandlingerSelectors } from "../../../../../../ducks/behandlinger";

const { PLIKTIG } = MKV.Koder.medlemskapstyper;

export interface PeriodeElementerProps {
  redigerbart: boolean;
  trygdedekninger: string[];
  innvilgelsesResultater: string[];
  control: Control;
  watch: UseFormWatch<any> | undefined;
  fields: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">[];
  handleSlett: (index: number) => void;
  handleChange: (medlemskapsperiode: MedlemskapsperiodeProp[], isValid: boolean, index: number) => void;
  formIsValid: boolean;
  handleLeggTil: () => void;
  visLeggTil: boolean;
  ukjentSluttdato?: boolean;
}

export function Medlemskapsperioder({
  redigerbart,
  trygdedekninger,
  innvilgelsesResultater,
  watch,
  fields,
  control,
  handleSlett,
  formIsValid,
  handleChange,
  handleLeggTil,
  visLeggTil,
  ukjentSluttdato,
}: PeriodeElementerProps) {
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const kanSlettePeriode = redigerbart && fields.length !== 1;
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const medlemskapsTypeErPliktig = medlemskapsperioder.some((periode) => periode.medlemskapstype === PLIKTIG);
  const erPensonistToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST);

  const filtrerInnvilgelsesResultater = (index: number) => {
    const avslåtteDekninger = [
      MKV.Koder.trygdedekninger.FULL_DEKNING_FTRL,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_A_ANDRE_LEDD_HELSE_SYKE_FORELDREPENGER,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_B_PENSJON,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_C_ANDRE_LEDD_HELSE_PENSJON_SYKE_FORELDREPENGER,
    ];

    if (!erPensonistToggleEnabled || behandlingstema !== MKV.Koder.behandlinger.behandlingstema.PENSJONIST) {
      return innvilgelsesResultater;
    }

    let valgtTrygdedekning;

    if (watch !== undefined) {
      valgtTrygdedekning = watch(`medlemskapsperioder[${index}].trygdedekning`);
    }

    if (avslåtteDekninger.includes(valgtTrygdedekning) && !medlemskapsTypeErPliktig) {
      return innvilgelsesResultater.filter((resultat) => resultat === "AVSLAATT");
    }

    return innvilgelsesResultater;
  };

  const filtrerTrygdedekninger = () => {
    const GYLDIGE_TRYGDEDEKNINGER_PENSJONIST = [
      MKV.Koder.trygdedekninger.FULL_DEKNING_FTRL,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_A_HELSE,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_A_ANDRE_LEDD_HELSE_SYKE_FORELDREPENGER,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_B_PENSJON,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON,
      MKV.Koder.trygdedekninger.FTRL_2_9_FØRSTE_LEDD_C_ANDRE_LEDD_HELSE_PENSJON_SYKE_FORELDREPENGER,
      MKV.Koder.trygdedekninger.FTRL_2_7_TREDJE_LEDD_B_HELSE_SYKE_FORELDREPENGER,
    ];

    if (!erPensonistToggleEnabled || behandlingstema !== MKV.Koder.behandlinger.behandlingstema.PENSJONIST) {
      return trygdedekninger;
    }

    return trygdedekninger.filter((dekninger) => GYLDIGE_TRYGDEDEKNINGER_PENSJONIST.includes(dekninger));
  };

  return (
    <div className="medlemskapsperioder">
      <div className="skjema__panel">
        {fields?.map((field, index) => (
          <div key={field.id}>
            <Nav.Row className="skjema__panel__rad">
              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Fra og med" : ""}
                  control={control}
                  name={`medlemskapsperioder[${index}].fomDato`}
                  aria-label={`Fra og med periode ${index + 1}`}
                  readOnly={!redigerbart}
                  onChange={(value) => {
                    const oppdatertPeriode = { ...field, fomDato: value };
                    handleChange(
                      [...fields.slice(0, index), oppdatertPeriode, ...fields.slice(index + 1)],
                      formIsValid,
                      index,
                    );
                  }}
                />
              </Nav.Column>
              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Til og med" : ""}
                  control={control}
                  name={`medlemskapsperioder[${index}].tomDato`}
                  aria-label={`Til og med periode ${index + 1}`}
                  readOnly={!redigerbart || ukjentSluttdato}
                  onChange={(value) => {
                    const oppdatertPeriode = { ...field, tomDato: value };
                    handleChange(
                      [...fields.slice(0, index), oppdatertPeriode, ...fields.slice(index + 1)],
                      formIsValid,
                      index,
                    );
                  }}
                />
              </Nav.Column>
              <Nav.Column className="trygdedekning">
                {(() => {
                  const filtrerteDekninger = filtrerTrygdedekninger();

                  return (
                    <Forms.Select
                      name={`medlemskapsperioder[${index}].trygdedekning`}
                      label={index === 0 ? "Trygdedekning" : ""}
                      hideLabel={index !== 0}
                      aria-label={`Trygdedekning periode ${index + 1}`}
                      control={control}
                      readOnly={!redigerbart}
                      emptyFieldDisabled={!!field.trygdedekning}
                      onChange={(value) => {
                        const oppdatertPeriode = { ...field, trygdedekning: value };
                        handleChange(
                          [...fields.slice(0, index), oppdatertPeriode, ...fields.slice(index + 1)],
                          formIsValid,
                          index,
                        );
                      }}
                    >
                      {filtrerteDekninger.map((dekning) => (
                        <option key={dekning} value={dekning}>
                          {KV.kodeTilTerm(dekning, MKV.KTObjects.trygdedekninger)}
                        </option>
                      ))}
                    </Forms.Select>
                  );
                })()}
              </Nav.Column>
              <Nav.Column>
                {(() => {
                  const filtrerteResultater = filtrerInnvilgelsesResultater(index);

                  return (
                    <Forms.Select
                      label={index === 0 ? "Resultat" : ""}
                      hideLabel={index !== 0}
                      name={`medlemskapsperioder[${index}].innvilgelsesResultat`}
                      aria-label={`Resultat periode ${index + 1}`}
                      control={control}
                      readOnly={!redigerbart}
                      emptyFieldDisabled={!!field.innvilgelsesResultat}
                      onChange={(value) => {
                        const oppdatertPeriode = { ...field, innvilgelsesResultat: value };
                        handleChange(
                          [...fields.slice(0, index), oppdatertPeriode, ...fields.slice(index + 1)],
                          formIsValid,
                          index,
                        );
                      }}
                    >
                      {filtrerteResultater.map((resultat) => (
                        <option key={resultat} value={resultat}>
                          {KV.kodeTilTerm(resultat, MKV.KTObjects.innvilgelsesResultat)}
                        </option>
                      ))}
                    </Forms.Select>
                  );
                })()}
              </Nav.Column>
              {kanSlettePeriode && (
                <Nav.Column className={index === 0 ? "slett slett__first" : "slett"}>
                  <Mui.IkonKnapp ikon={Ikoner.Bin} onClick={() => handleSlett(index)} ariaLabel="Slett periode" />
                </Nav.Column>
              )}
            </Nav.Row>
            {field.feil && (
              <Nav.Alert variant="error" className="medlemskapsperiodeFeil">
                {field.feil}
              </Nav.Alert>
            )}
          </div>
        ))}
        {visLeggTil && !medlemskapsTypeErPliktig && (
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
              Legg til periode
            </Mui.Lenkeknapp>
          </Nav.Row>
        )}
      </div>
    </div>
  );
}
