import { UNSAFE_Combobox as Combobox } from "@navikt/ds-react";
import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Forms from "../../../felleskomponenter/forms";
import * as Nav from "../../../navFrontend";
import { getErrorMessage } from "../../../felleskomponenter/forms/misc/mapFeilmelding";
import { Control, Controller, FieldValues } from "react-hook-form";
import { KTObject } from "@navikt/melosys-kodeverk";

type ComboboxOption = { label: string; value: string };

const { USA_ART5_2, USA_ART5_9 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us;
const { CAN_ART7, CAN_ART11 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca;
const UNNTATT_CAN_7_5_B = KV.kodeTilObjekt(MKV.Koder.trygdedekninger.UNNTATT_CAN_7_5_B, MKV.KTObjects.trygdedekninger);
const UNNTATT_USA_5_2_G = KV.kodeTilObjekt(MKV.Koder.trygdedekninger.UNNTATT_USA_5_2_G, MKV.KTObjects.trygdedekninger);
const UTEN_DEKNING = KV.kodeTilObjekt(MKV.Koder.trygdedekninger.UTEN_DEKNING, MKV.KTObjects.trygdedekninger);

const hentTrygdedekningterm = (bestemmelse?: string) => {
  if (bestemmelse === USA_ART5_2) return UNNTATT_USA_5_2_G.term;
  if (bestemmelse === CAN_ART7) return UNNTATT_CAN_7_5_B.term;
  return UTEN_DEKNING.term;
};

interface BestemmelseSelectProps {
  formValues: FieldValues;
  control: Control;
  bestemmelser: KTObject[] | undefined;
  lagreBestemmelse: (bestemmelse: string) => void;
  lagreTrygdedekning: (trygdedekning: string) => void;
  redigerbart: boolean;
}

export function BestemmelseSelect({
  formValues,
  control,
  bestemmelser,
  lagreBestemmelse,
  lagreTrygdedekning,
  redigerbart,
}: BestemmelseSelectProps) {
  const skalViseDekningSelect = [CAN_ART11, USA_ART5_9].includes(formValues?.bestemmelse);
  const bestemmelseOpsjoner: ComboboxOption[] = (bestemmelser ?? []).map((item) => ({
    label: item.term ?? item.kode,
    value: item.kode,
  }));

  return (
    <Nav.Row>
      <Nav.Column xs="6">
        <Controller
          name="bestemmelse"
          control={control}
          render={({ field, formState }) => (
            <Combobox
              label="Bestemmelse"
              size="small"
              options={bestemmelseOpsjoner}
              selectedOptions={bestemmelseOpsjoner.filter((opsjon) => opsjon.value === field.value)}
              onToggleSelected={(kode, erValgt) => {
                const valgtKode = erValgt ? kode : "";
                field.onChange(valgtKode);
                lagreBestemmelse(valgtKode);
              }}
              shouldAutocomplete
              readOnly={!redigerbart}
              error={getErrorMessage(field, formState)}
            />
          )}
        />
      </Nav.Column>
      {formValues?.bestemmelse && (
        <Nav.Column xs="6">
          {skalViseDekningSelect ? (
            <Forms.Select
              name="trygdedekning"
              control={control}
              label="Dekning"
              emptyFieldDisabled={!!formValues.trygdedekning}
              readOnly={!redigerbart}
              onChange={lagreTrygdedekning}
            >
              <option value={UTEN_DEKNING.kode}>{UTEN_DEKNING.term}</option>
              <option value={formValues?.bestemmelse === USA_ART5_9 ? UNNTATT_USA_5_2_G.kode : UNNTATT_CAN_7_5_B.kode}>
                {formValues?.bestemmelse === USA_ART5_9 ? UNNTATT_USA_5_2_G.term : UNNTATT_CAN_7_5_B.term}
              </option>
            </Forms.Select>
          ) : (
            <>
              <Nav.BodyLong weight="semibold" size="small" className="trygdedekning__label">
                Dekning
              </Nav.BodyLong>
              <div className="trygdedekning__panel">
                <Nav.BodyLong size="small">{hentTrygdedekningterm(formValues?.bestemmelse)}</Nav.BodyLong>
              </div>
            </>
          )}
        </Nav.Column>
      )}
    </Nav.Row>
  );
}
