import React, { useState } from "react";
import { getFormValues, reduxForm } from "redux-form";
import { connect } from "react-redux";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../utils/navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as Hooks from "../../../hooks";

import PdfLenkeListe from "../../pdfLenkeListe";
import Mottakerinstitusjonvelger from "../../mottakerinstitusjonvelger";
import VedleggVelger from "../../vedleggvelger";
import { useFeatureToggle } from "../../../featuretoggle";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { dokumenterSelectors } from "../../../ducks/dokumenter";

import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from "../../../yup";

import "./vurderingVideresend.css";
import * as Skjema from "../../skjema";

export const VurderingVideresend = ({
  redigerbart,
  behandlingID,
  bostedsland,
  fysiskeDokument,
  handleSubmit,
  form,
  formValues,
}) => {
  const pdfDokumenter = [
    {
      navn: "Forhåndsvis orienteringsbrev",
      type: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_VIDERESENDT_SOEKNAD,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: formValues.orienteringsbrevFritekst,
      },
    },
    {
      navn: "Forhåndsvis SED A008",
      type: EKV.Koder.sedtyper.A008,
      erSed: true,
    },
  ];

  const [videresendPending, setVideresendPending] = useState(false);
  const [valgteVedlegg, setValgteVedlegg] = useState([]);
  const isMounted = Hooks.useIsMounted();
  const [videresendingVedleggToggle] = useFeatureToggle("melosys.videresending_vedlegg");

  const videresendSoknad = async (values, dispatch, props) => {
    setVideresendPending(true);

    const vedlegg = valgteVedlegg.map(({ journalpostID, dokumentID }) => ({ journalpostID, dokumentID }));
    await props.videresendSoknad(values.mottakerinstitusjon, values.orienteringsbrevFritekst, vedlegg);

    // Videresend-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setVideresendPending(false);
    }
  };

  return (
    <div className="videresendSoknad">
      <form onSubmit={handleSubmit(videresendSoknad)}>
        <Nav.typo.Undertittel>Videresending av søknad</Nav.typo.Undertittel>
        <Nav.Row>
          <Nav.Column xs="8">
            <Skjema.Textarea
              feltNavn="orienteringsbrevFritekst"
              label="Fritekst til orienteringsbrev"
              placeholder="Skriv inn tekst til orienteringsbrevet..."
              maxLength={500}
              visTellerFra={500}
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
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
          <Nav.Column xs="6">
            {redigerbart && <PdfLenkeListe dokumenter={pdfDokumenter} behandlingID={behandlingID} />}
          </Nav.Column>
        </Nav.Row>
        {videresendingVedleggToggle === "enabled" && (
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.typo.Undertittel>Vedlegg til SED</Nav.typo.Undertittel>
              <VedleggVelger valgteVedlegg={valgteVedlegg} onChange={setValgteVedlegg} dokumenter={fysiskeDokument} />
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Nav.Hovedknapp spinner={videresendPending} autoDisableVedSpinner disabled={!redigerbart} htmlType="submit">
              VIDERESEND SØKNAD
            </Nav.Hovedknapp>
          </Nav.Column>
        </Nav.Row>
      </form>
    </div>
  );
};

VurderingVideresend.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  videresendSoknad: PT.func.isRequired,
  bostedsland: MPT.Kodeverk,
  handleSubmit: PT.func.isRequired,
  form: PT.string.isRequired,
  formValues: PT.object,
  fysiskeDokument: PT.arrayOf(PT.object).isRequired,
};

VurderingVideresend.defaultProps = {
  bostedsland: {
    kode: "",
    term: "",
  },
  formValues: {},
};

const VurderingVideresendForm = reduxForm({
  form: KV.Form.VURDERING_VIDERESEND,
  enableReinitialize: true,
  destroyOnUnmount: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(YupSkjemaer.vurdering_videresend),
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
  },
});

export default connect(mapStateToProps)(VurderingVideresendForm);
