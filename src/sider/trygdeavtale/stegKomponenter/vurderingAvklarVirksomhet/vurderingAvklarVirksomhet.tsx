import { useEffect } from "react";
import { FieldValues, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import * as Api from "../../../../services/api";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { StegStatus } from "../../stegvelger";

import vurdering_avklar_virksomhet from "./vurderingAvklarVirksomhetSchema";
import "./vurderingAvklarVirksomhet.less";
import { HJELPETEKST, INGEN_VIRKSOMHETER_TEKST } from "./tekster";

interface Props {
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  tilbake: () => void;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat) => void;
  aktivtSteg: boolean;
}

function VurderingAvklarVirksomhet({
  data,
  fortsett,
  redigerbart,
  resultat,
  steg,
  oppdaterFlyt,
  tilbake,
  aktivtSteg,
}: Props) {
  const virksomheterListe =
    data?.virksomheter?.map((virksomhet: Api.Trygdeavtale.Virksomhet) => ({
      kode: virksomhet.orgId,
      term: virksomhet.navn,
    })) || [];

  const {
    control,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver<FieldValues, unknown, FieldValues>(vurdering_avklar_virksomhet),
    mode: "onChange",
    defaultValues: { virksomhet: resultat?.virksomhet ?? "" },
  });
  const virksomhet = useWatch({ control, name: "virksomhet" });

  useEffect(() => {
    if (redigerbart && aktivtSteg) {
      oppdaterFlyt({
        ...resultat,
        virksomhet: virksomhet || null,
      });
    }
  }, [virksomhet, redigerbart, aktivtSteg]);

  const harVirksomheter = Array.isArray(virksomheterListe) && virksomheterListe.length > 0;

  return (
    <div className="vurderingAvklarVirksomhet">
      <Nav.Heading level="1" className="stegvelgertittel">
        <LabelMedHjelpetekst label="Virksomhet" bold />
      </Nav.Heading>

      {harVirksomheter ? (
        <Forms.RadioGroup
          legend={<LabelMedHjelpetekst label="Velg virksomhet" hjelpetekst={HJELPETEKST} bold small />}
          hideLegend
          name="virksomhet"
          control={control}
          readOnly={!redigerbart}
        >
          {virksomheterListe.map((virksomhet) => (
            <Nav.Radio key={virksomhet.kode} value={virksomhet.kode}>
              {virksomhet.term}
            </Nav.Radio>
          ))}
        </Forms.RadioGroup>
      ) : (
        <Nav.Alert variant="error" className="alertstripe">
          {INGEN_VIRKSOMHETER_TEKST}
        </Nav.Alert>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fortsett,
          disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}

export default VurderingAvklarVirksomhet;
