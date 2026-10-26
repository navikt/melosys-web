import { MouseEvent, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import {
  change,
  DecoratedFormProps,
  FieldArray,
  getFormValues,
  InjectedFormProps,
  reduxForm,
  WrappedFieldArrayProps,
} from "redux-form";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { useDispatch } from "../../../../hooks";

import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
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

const INGEN_VALG: string[] = [];

interface OvergangsregelCheckboxerProps {
  muligeValg: KTObject[];
  disabled: boolean;
}

function OvergangsregelCheckboxer({
  fields,
  meta,
  muligeValg,
  disabled,
}: WrappedFieldArrayProps<string> & OvergangsregelCheckboxerProps) {
  const dispatch = useDispatch();

  return (
    <Mui.KodeTermCheckboxGroup
      legend="Overgangsregler gjelder"
      muligeValg={muligeValg}
      defaultValg={fields.getAll() ?? INGEN_VALG}
      onChange={(valgte) => dispatch(change(meta.form, fields.name, valgte))}
      disabled={disabled}
      error={meta.error}
    />
  );
}

interface FormValues {
  fom?: string;
  tom?: string;
  lovvalgsbestemmelse?: string;
  lovvalgsland?: string;
  utpekingVurdering?: string;
  overgangsregelbestemmelser?: string[];
}

interface OwnProps {
  slettData: (data?: unknown) => void;
  tilbake: () => void;
  bekreftOgFortsett: () => void;
  oppdaterData: (data: unknown) => void;
  redigerbart: boolean;
  tilstand: {
    harAvklaring: boolean;
    lovvalgsbestemmelse?: string;
    lovvalgsland?: string;
  };
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
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
    formValues: getFormValues(KV.Form.VURDER_UTPEKING)(state) as FormValues | undefined,
    initialValues: {
      fom: initialLovvalgsperiodeFom ? Utils.dato.formatterDatoTilNorsk(initialLovvalgsperiodeFom) : "",
      tom: initialLovvalgsperiodeTom ? Utils.dato.formatterDatoTilNorsk(initialLovvalgsperiodeTom) : "",
      lovvalgsbestemmelse: ownProps.tilstand.lovvalgsbestemmelse || "",
      lovvalgsland: ownProps.tilstand.lovvalgsland,
      utpekingVurdering: flytSelectors.UtpekingVurderingSelector(state),
      overgangsregelbestemmelser: mottatteOpplysningerSelectors
        .OvergangsregelbestemmelserSelector(state)
        .map((o: KTObject) => o.kode),
    },
    vurderingBegrunnelser: behandlingsresultatSelectors.KontrollresultatBegrunnelseKoderSelector(state) as
      string[] | undefined,
    ytterligereInformasjon: mottatteOpplysningerSelectors.YtterligereInformasjonSelector(state) as string | null,
    behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state) as string,
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state) as number,
  };
};

const connector = connect(mapStateToProps);

type VurderingUtpektProps = ConnectedProps<typeof connector> & OwnProps;

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
}: VurderingUtpektProps & InjectedFormProps<FormValues, VurderingUtpektProps>) {
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
            <FieldArray
              name="overgangsregelbestemmelser"
              component={OvergangsregelCheckboxer}
              muligeValg={MKV.KTObjects.lovvalgsbestemmelser.overgangsregelbestemmelser}
              disabled={!redigerbart}
            />
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
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            tilbake();
          },
          disabled: !redigerbart,
        }}
      />
    </form>
  );
}

export const VurderingUtpektForm = reduxForm<FormValues, VurderingUtpektProps>({
  onSubmit: (_values: FormValues, _dispatch: unknown, props: DecoratedFormProps<FormValues, VurderingUtpektProps>) =>
    props.bekreftOgFortsett(),
  form: KV.Form.VURDER_UTPEKING,
  enableReinitialize: false,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurderingUtpektSchema),
})(VurderingUtpekt);

export default connector(VurderingUtpektForm);
