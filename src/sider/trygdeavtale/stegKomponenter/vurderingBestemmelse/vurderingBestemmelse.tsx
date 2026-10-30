import { useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { FieldValues, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Utils from "../../../../utils";

import { StegStatus } from "../../stegvelger";

import vurdering_bestemmelse from "./vurderingBestemmelseSchema";

import "./vurderingBestemmelse.less";
import BestemmelseHjelpetekst from "./bestemmelseHjelpetekst/bestemmelseHjelpetekst";
import { IngenFlytMelding, UnntakHjelpetekst } from "../../../../felleskomponenter/alertmeldinger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { Box } from "@navikt/ds-react";

const { NEI_ANMODE_OM_UNNTAK, NEI_AVSLAG, JA_FATTE_VEDTAK } = KV.Koder.AvtalelandUtfall;

const mapStateToProps = (state: RootState) => ({
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  slettLovvalgsperiode: (behandlingID: number, lovvalgsperiodeID: number) =>
    dispatch(lovvalgsperioderOperations.slettLovvalgsperiode(behandlingID, lovvalgsperiodeID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValues {
  vedtak: string;
  bestemmelse: string;
  tilleggsbestemmelse: boolean;
}

interface Props {
  data: Api.Trygdeavtale.StegData;
  fortsett: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat, callback?: () => void) => void;
  aktivtSteg: boolean;
}

function VurderingBestemmelse({
  data: { vedtakValg, bestemmelseValg, tilleggsbestemmelseValg },
  fortsett,
  tilbake,
  redigerbart,
  resultat,
  steg,
  oppdaterFlyt,
  aktivtSteg,
  lovvalgsperiode,
  slettLovvalgsperiode,
  behandlingID,
}: PropsFromRedux & Props) {
  const [updatePending, setUpdatePending] = useState(false);
  const {
    control,
    setValue,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver<FieldValues, unknown, FieldValues>(vurdering_bestemmelse),
    mode: "onChange",
    defaultValues: {
      vedtak: resultat?.vedtak ?? "",
      bestemmelse: resultat?.bestemmelse ?? "",
      tilleggsbestemmelse: Boolean(resultat?.tilleggsbestemmelse),
    },
  });
  const formValues = useWatch({ control }) as FormValues;

  const skalLagreVedtaksvalg = formValues?.vedtak !== NEI_ANMODE_OM_UNNTAK && formValues?.vedtak !== NEI_AVSLAG;

  useEffect(() => {
    if (redigerbart && aktivtSteg) {
      setUpdatePending(true);
      oppdaterFlyt(
        {
          ...resultat,
          vedtak: skalLagreVedtaksvalg ? formValues.vedtak || undefined : undefined,
          bestemmelse: formValues.bestemmelse || undefined,
          tilleggsbestemmelse: formValues.tilleggsbestemmelse ? tilleggsbestemmelseValg?.kode : undefined,
        },
        () => {
          setUpdatePending(false);
          if (formValues?.vedtak && formValues.vedtak !== JA_FATTE_VEDTAK && lovvalgsperiode?.periodeID) {
            slettLovvalgsperiode(behandlingID, lovvalgsperiode.periodeID);
          }
        },
      );
    }
  }, [formValues?.vedtak, formValues?.bestemmelse, formValues?.tilleggsbestemmelse]);

  return (
    <div className="vurderingBestemmelse_trygdeavtale">
      <Nav.Heading level="1" className="stegvelgertittel">
        Bestemmelse og vurdering
      </Nav.Heading>

      <Forms.RadioGroup
        legend="Hva er din vurdering av søknaden?"
        name="vedtak"
        control={control}
        readOnly={!redigerbart || updatePending}
        onChange={() => {
          setValue("tilleggsbestemmelse", false, { shouldValidate: true });
          setValue("bestemmelse", "", { shouldValidate: true });
        }}
        size="small"
      >
        {vedtakValg?.map((valg) => (
          <Nav.Radio key={valg.kode} value={valg.kode}>
            {valg.term}
          </Nav.Radio>
        ))}
      </Forms.RadioGroup>
      {formValues?.vedtak && !Utils._isEmpty(bestemmelseValg) && (
        <Nav.Fieldset legend="">
          <Nav.Row>
            <Nav.Column lg="8">
              <Forms.Select
                label="Velg bestemmelse"
                name="bestemmelse"
                control={control}
                readOnly={!redigerbart || updatePending}
                emptyFieldDisabled={!!formValues.bestemmelse}
                onChange={() => setValue("tilleggsbestemmelse", false, { shouldValidate: true })}
              >
                {bestemmelseValg?.map((bestemmelse: KTObject) => (
                  <option key={bestemmelse.kode} value={bestemmelse.kode}>
                    {bestemmelse.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      )}
      {formValues?.vedtak && !Utils._isEmpty(tilleggsbestemmelseValg) && (
        <Nav.Row>
          <Nav.Column xs="10">
            <Forms.Checkbox
              name="tilleggsbestemmelse"
              control={control}
              label={tilleggsbestemmelseValg?.term}
              readOnly={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      {formValues?.vedtak === NEI_ANMODE_OM_UNNTAK && (
        <Nav.Row>
          <Nav.Column xs="10" className="unntakHjelpetektsWrapper">
            <UnntakHjelpetekst />
          </Nav.Column>
        </Nav.Row>
      )}
      {formValues?.vedtak === NEI_AVSLAG && (
        <Nav.Row>
          <Nav.Column xs="10">
            <IngenFlytMelding />
          </Nav.Column>
        </Nav.Row>
      )}
      {formValues?.bestemmelse && (
        <Box padding="space-16" background="neutral-soft">
          <BestemmelseHjelpetekst bestemmelse={formValues.bestemmelse} />
        </Box>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fortsett,
          disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart || updatePending,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}

export default connector(VurderingBestemmelse);
