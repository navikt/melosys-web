import { useEffect, useState } from "react";
import PT from "prop-types";
import { connect, useDispatch } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";

import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
import * as MPT from "../../../../proptypes";
import * as Utils from "../../../../utils";

import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import RegisterKontrollTreff from "../../../../felleskomponenter/registerkontrollTreff";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { flytSelectors } from "../../../../ducks/flyt";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";

import {
  konverterLovvalgsbestemmelseTilStegData,
  konverterLovvalgslandTilStegData,
  konverterLovvalgsperiodeTilStegData,
  lagLovvalgsbestemmelse,
  lagLovvalgsland,
  lagLovvalgsperiode,
  slettLovvalgsperiode,
} from "../../../../felleskomponenter/stegvelger";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurderingUtpektSchema from "./vurderingUtpektSchema";

import "./vurderingUtpekt.less";

export function VurderingUtpekt({
  vurderingBegrunnelser = [],
  slettData,
  tilbake,
  oppdaterData,
  redigerbart,
  tilstand: { harAvklaring, lovvalgsbestemmelse, lovvalgsland },
  handleSubmit,
  formValues = {},
  lovvalgsperiode,
  ytterligereInformasjon = null,
  behandlingstema,
  behandlingID,
}) {
  const lovvalgsbestemmelserStottetAvBrevVedNorgeUtpekt = MKV.Kodekombinasjoner.alleEØSLovvalg.filter(
    ({ kode }) =>
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1 ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2 ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3 ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4 ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2A ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3 ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4 ||
      kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
  );

  const [erBucAapen, setErBucAapen] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    Api.Kontroll.erBucAapen(behandlingID).then((res) => {
      setErBucAapen(res);
      if (!res)
        dispatch(change(KV.Form.VURDER_UTPEKING, "utpekingVurdering", MKV.Koder.utfallregistreringunntak.GODKJENT));
    });
    if (lovvalgsland) {
      oppdaterData(konverterLovvalgslandTilStegData(lovvalgsland));
      oppdaterData(lagLovvalgsland(lovvalgsland));
    }
    if (lovvalgsbestemmelse) oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    oppdaterData(konverterLovvalgsperiodeTilStegData(lovvalgsperiode));

    return () => {
      slettData();
    };
  }, []);

  useEffect(() => {
    oppdaterData(lagLovvalgsbestemmelse(formValues.lovvalgsbestemmelse));
  }, [formValues.lovvalgsbestemmelse]);

  const formValid = () => {
    const { fom, tom } = formValues;
    return Boolean(Utils.dato.vaskInputDato(fom)) && Boolean(Utils.dato.vaskInputDato(tom));
  };

  useEffect(() => {
    if (formValid()) {
      oppdaterData(
        lagLovvalgsperiode({
          fomDato: Utils.dato.formatterDatoTilISO(formValues.fom),
          tomDato: Utils.dato.formatterDatoTilISO(formValues.tom),
        }),
      );
    } else {
      slettData(slettLovvalgsperiode());
    }
  }, [formValues]);

  const lovvalgslandFraForm = formValues.lovvalgsland;
  const visLovvalgsland = lovvalgslandFraForm && lovvalgslandFraForm !== MKV.Koder.landkoder.NO;
  const lovvalgslandTerm = KV.kodeTilTerm(lovvalgslandFraForm, MKV.KTObjects.landkoder);
  const lovvalgsbestemmelser =
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE
      ? lovvalgsbestemmelserStottetAvBrevVedNorgeUtpekt
      : MKV.Kodekombinasjoner.alleEØSLovvalg;

  return (
    <form className="vurderingutpekt" onSubmit={handleSubmit}>
      {!erBucAapen ? (
        <Nav.Alert className="buc__varsel" variant="warning">
          <strong>BUC er lukket</strong>
          <ul>
            <li>Du kan godkjenne perioden ved å trykke &quot;Bekreft og fortsett&quot;.</li>
            <li>
              Hvis du ikke ønsker å godkjenne perioden må du sende en SED i en ny BUC og oppdatere behandlingsstatus til
              &quot;Avventer svar fra utenlandsk trygdemyndighet&quot;.
            </li>
          </ul>
        </Nav.Alert>
      ) : null}
      <Nav.Heading level="1" className="stegvelgertittel">
        Vurder lovvalgsbeslutningen (A003)
      </Nav.Heading>
      <Nav.Row className="rad">
        <Nav.Column xs="7">
          {vurderingBegrunnelser.length > 0 && (
            <>
              <Nav.BodyLong weight="semibold" size="small">
                Treff ved automatisk kontroll
              </Nav.BodyLong>
              <RegisterKontrollTreff vurderingBegrunnelser={vurderingBegrunnelser} />
            </>
          )}
        </Nav.Column>
      </Nav.Row>
      {visLovvalgsland && (
        <Nav.Row className="rad">
          <Nav.Column xs="5">
            <Nav.BodyLong weight="semibold" size="small">
              Lovvalgsland
            </Nav.BodyLong>
            <Nav.BodyLong size="small">{lovvalgslandTerm}</Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          <Nav.BodyLong weight="semibold" size="small">
            Grunnlag
          </Nav.BodyLong>
          <Skjema.Select feltNavn="lovvalgsbestemmelse" label="" disabled={!redigerbart}>
            <option disabled key="VELG" value="">
              Velg
            </option>
            {lovvalgsbestemmelser.map((kodeObjekt) => (
              <option key={Utils._uuid()} value={kodeObjekt.kode}>
                {kodeObjekt.term}
              </option>
            ))}
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>
      {(redigerbart || formValues.overgangsregelbestemmelser) && (
        <Nav.Row className="rad">
          <Nav.Column xs="5">
            <Nav.BodyLong weight="semibold" size="small">
              Overgangsregler gjelder:
            </Nav.BodyLong>
            <Nav.Fieldset>
              <Skjema.ListeVelger
                feltNavn="overgangsregelbestemmelser"
                label="Legg til ny overgangsregelbestemmelse:"
                placeholder="(Velg bestemmelse)"
                muligeValg={MKV.KTObjects.lovvalgsbestemmelser.overgangsregelbestemmelser}
                disabled={!redigerbart}
                gruppe
              />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row className="rad">
        <Nav.Column xs="5">
          <Nav.BodyLong weight="semibold" size="small">
            Lovvalgsperiode
          </Nav.BodyLong>
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Datovelger label="Fra og med" feltNavn="fom" disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="6">
              <Skjema.Datovelger
                label="Til og med"
                feltNavn="tom"
                disabled={!redigerbart}
                minDate={Utils.dato.norskStringTilDate(formValues.fom)}
              />
            </Nav.Column>
          </Nav.Row>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="rad">
        {ytterligereInformasjon && (
          <Nav.Column xs="12">
            <Nav.BodyLong weight="semibold" size="small">
              Ytterligere informasjon fra SED
            </Nav.BodyLong>
            <Nav.BodyLong size="small">{ytterligereInformasjon}</Nav.BodyLong>
          </Nav.Column>
        )}
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="5">
          <Skjema.RadioGroup
            legend="Skal lovvalget godkjennes?"
            name="utpekingVurdering"
            readOnly={!redigerbart || !erBucAapen}
          >
            <Nav.Radio value={MKV.Koder.utfallregistreringunntak.GODKJENT}>Godkjenn</Nav.Radio>
            <Nav.Radio value={MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT}>Ikke godkjenn</Nav.Radio>
          </Skjema.RadioGroup>
        </Nav.Column>
      </Nav.Row>
      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !(redigerbart && harAvklaring),
        }}
        tilbakeKnappProps={{
          onClick: (e) => {
            e.preventDefault();
            tilbake();
          },
          disabled: !redigerbart,
        }}
      />
    </form>
  );
}

VurderingUtpekt.propTypes = {
  vurderingBegrunnelser: PT.arrayOf(PT.string),
  slettData: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  bekreftOgFortsett: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  tilstand: PT.shape({
    harAvklaring: PT.bool.isRequired,
    lovvalgsbestemmelse: PT.string,
    lovvalgsland: PT.string,
  }).isRequired,
  oppdaterData: PT.func.isRequired,
  handleSubmit: PT.func.isRequired,
  formValues: PT.object,
  lovvalgsperiode: MPT.Periode.isRequired,
  ytterligereInformasjon: PT.string,
  behandlingstema: PT.string.isRequired,
  behandlingID: PT.number.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const behandlingsstatus = behandlingerSelectors.BehandlingsstatusKodeSelector(state);

  const behandlingsstatusErAvsluttetEllerMidlertidigBeslutning =
    MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus);

  const lovvalgsperiode = behandlingsstatusErAvsluttetEllerMidlertidigBeslutning
    ? {
        fomDato: lovvalgsperioderSelectors.FomDatoSelector(state),
        tomDato: lovvalgsperioderSelectors.TomDatoSelector(state),
      }
    : {
        fomDato: mottatteOpplysningerSelectors.PeriodeFomSelector(state),
        tomDato: mottatteOpplysningerSelectors.PeriodeTomSelector(state),
      };

  const initialLovvalgsperiodeFom = behandlingsstatusErAvsluttetEllerMidlertidigBeslutning
    ? lovvalgsperioderSelectors.FomDatoSelector(state)
    : behandlingerSelectors.LovvalgsperiodeFomSelector(state);
  const initialLovvalgsperiodeTom = behandlingsstatusErAvsluttetEllerMidlertidigBeslutning
    ? lovvalgsperioderSelectors.TomDatoSelector(state)
    : behandlingerSelectors.LovvalgsperiodeTomSelector(state);

  return {
    lovvalgsperiode,
    formValues: getFormValues(KV.Form.VURDER_UTPEKING)(state),
    initialValues: {
      fom: initialLovvalgsperiodeFom ? Utils.dato.formatterDatoTilNorsk(initialLovvalgsperiodeFom) : "",
      tom: initialLovvalgsperiodeTom ? Utils.dato.formatterDatoTilNorsk(initialLovvalgsperiodeTom) : "",
      lovvalgsbestemmelse: ownProps.tilstand.lovvalgsbestemmelse || "",
      lovvalgsland: ownProps.tilstand.lovvalgsland,
      utpekingVurdering: flytSelectors.UtpekingVurderingSelector(state),
      overgangsregelbestemmelser: mottatteOpplysningerSelectors
        .OvergangsregelbestemmelserSelector(state)
        .map((o) => o.kode),
    },
    vurderingBegrunnelser: behandlingsresultatSelectors.KontrollresultatBegrunnelseKoderSelector(state),
    ytterligereInformasjon: mottatteOpplysningerSelectors.YtterligereInformasjonSelector(state),
    behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  };
};

const nesteSteg = (values, dispatch, props) => {
  props.bekreftOgFortsett();
};

export const VurderingUtpektForm = reduxForm({
  onSubmit: nesteSteg,
  form: KV.Form.VURDER_UTPEKING,
  enableReinitialize: false,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurderingUtpektSchema),
})(VurderingUtpekt);

export default connect(mapStateToProps)(VurderingUtpektForm);
