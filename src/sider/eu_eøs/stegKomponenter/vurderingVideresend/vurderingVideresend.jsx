import { useEffect, useState } from "react";
import { getFormValues, reduxForm } from "redux-form";
import { connect, useSelector } from "react-redux";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import * as MPT from "../../../../proptypes";
import * as KV from "../../../../kodeverk";
import * as Hooks from "../../../../hooks";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Skjema from "../../../../felleskomponenter/skjema";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import Mottakerinstitusjonvelger from "../../../../felleskomponenter/mottakerinstitusjonvelger";
import VedleggVelger from "../../../../felleskomponenter/vedleggvelger";
import VedleggTable from "../../../../felleskomponenter/vedleggTable";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { dokumenterSelectors } from "../../../../ducks/dokumenter";
import { feiletResponsOperations } from "../../../../ducks/feiletRespons";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_A008_CDM_4_4 } from "../../../../featuretoggle/toggleNavn";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurderingVideresendSchema from "../vurderingVideresendSchema";
import "./vurderingVideresend.less";

export function VurderingVideresend({
  redigerbart,
  behandlingID,
  bostedsland = { kode: "", term: "" },
  fysiskeDokument,
  handleSubmit,
  form,
  formValues = {},
  tilbake,
  resetFeiletRespons,
}) {
  const isA008Cdm44Enabled = useFeatureToggle(MELOSYS_A008_CDM_4_4);

  const pdfDokumenter = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_VIDERESENDT_SOEKNAD,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: formValues.orienteringsbrevFritekst,
      },
    },
    {
      sedType: EKV.Koder.sedtyper.A008,
      sedData: {
        fritekst: isA008Cdm44Enabled ? formValues.ytterligereInformasjonSed : undefined,
        a008Formaal: isA008Cdm44Enabled ? "arbeid_flere_land" : undefined,
      },
    },
  ];

  const [videresendPending, setVideresendPending] = useState(false);
  const [valgteVedlegg, setValgteVedlegg] = useState({
    saksvedlegg: [],
    standardvedlegg: null,
  });

  const tilgjengeligeStandardvedlegg = []; // TODO: Skal implementeres i MELOSYS-7071

  const isMounted = Hooks.useIsMounted();

  // Nullstill eventuelle feilmeldinger når steget vises
  useEffect(() => {
    resetFeiletRespons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVedleggChange = (newVedlegg) => {
    resetFeiletRespons();
    setValgteVedlegg(newVedlegg);
  };

  const videresendSoknad = async (values, dispatch, props) => {
    setVideresendPending(true);

    const vedlegg = valgteVedlegg.saksvedlegg.map(({ journalpostID, dokumentID }) => ({ journalpostID, dokumentID }));
    await props.videresendSoknad(
      values.mottakerinstitusjon,
      values.orienteringsbrevFritekst,
      isA008Cdm44Enabled ? values.ytterligereInformasjonSed : null,
      isA008Cdm44Enabled ? "arbeid_flere_land" : null,
      vedlegg,
    );

    // Videresend-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setVideresendPending(false);
    }
  };

  return (
    <div className="videresendSoknad">
      <form onSubmit={handleSubmit(videresendSoknad)}>
        <Nav.Heading level="1" className="stegvelgertittel">
          Videresending av søknad
        </Nav.Heading>
        <Nav.Row>
          <Nav.Column xs="8">
            <Skjema.Textarea
              feltNavn="orienteringsbrevFritekst"
              label="Fritekst til orienteringsbrev"
              placeholder="Skriv inn tekst til orienteringsbrevet..."
              readOnly={!redigerbart}
              maxLength={10000}
            />
          </Nav.Column>
        </Nav.Row>
        {isA008Cdm44Enabled && (
          <Nav.Row>
            <Nav.Column xs="8">
              <Skjema.Textarea
                feltNavn="ytterligereInformasjonSed"
                label="Ytterligere informasjon (valgfritt)"
                description="Denne teksten legges ved i SED A008"
                placeholder="Skriv inn ytterligere informasjon..."
                readOnly={!redigerbart}
              />
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row className="mottakerinstitusjoner">
          <Nav.Column xs="8">
            <Mottakerinstitusjonvelger
              form={form}
              redigerbart={redigerbart}
              landkode={bostedsland.kode}
              bucType={EKV.Koder.buctyper.legislation.LA_BUC_03}
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="8">
            {redigerbart && <Dokumentliste dokumenter={pdfDokumenter} behandlingID={behandlingID} />}
          </Nav.Column>
        </Nav.Row>
        {redigerbart && (
          <Nav.Row>
            <Nav.Column xs="6">
              <VedleggTable
                valgteVedlegg={valgteVedlegg}
                label="Vedlegg til SED"
                setValgteVedlegg={handleVedleggChange}
                redigerbart={redigerbart}
              />
              <VedleggVelger
                valgteVedlegg={valgteVedlegg}
                onChange={handleVedleggChange}
                onOpen={resetFeiletRespons}
                dokumenter={fysiskeDokument}
                redigerbart={redigerbart}
                standardvedlegg={tilgjengeligeStandardvedlegg}
              />
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Mui.StegKnapper
              bekreftKnappProps={{
                loading: videresendPending,
                disabled: !redigerbart,
              }}
              bekreftTekst="Videresend søknad"
              tilbakeKnappProps={{
                onClick: (e) => {
                  e.preventDefault();
                  tilbake();
                },
                disabled: !redigerbart,
              }}
            />
          </Nav.Column>
        </Nav.Row>
      </form>
    </div>
  );
}

VurderingVideresend.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  videresendSoknad: PT.func.isRequired,
  tilbake: PT.func.isRequired,
  bostedsland: MPT.Kodeverk,
  handleSubmit: PT.func.isRequired,
  form: PT.string.isRequired,
  formValues: PT.object,
  fysiskeDokument: PT.arrayOf(PT.object).isRequired,
  resetFeiletRespons: PT.func.isRequired,
};

const VurderingVideresendForm = reduxForm({
  form: KV.Form.VURDERING_VIDERESEND,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurderingVideresendSchema),
})(VurderingVideresend);

const mapStateToProps = (state) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
  fysiskeDokument: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  formValues: getFormValues(KV.Form.VURDERING_VIDERESEND)(state),
  initialValues: {
    mottakerinstitusjon: "",
    kreverMottakerinstitusjon: false,
    orienteringsbrevFritekst: "",
    ytterligereInformasjonSed: "",
  },
});

const mapDispatchToProps = (dispatch) => ({
  resetFeiletRespons: () => dispatch(feiletResponsOperations.resetFeiletRespons()),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingVideresendForm);
