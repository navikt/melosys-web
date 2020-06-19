import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as MPT from '../../../proptypes';
import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import * as Mui from '../../../felleskomponenter/ui';
import * as Ikoner from '../../../resources/images';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { redigerbartSelectors } from '../../../ducks/redigerbart';
import { behandlingsgrunnlagSelectors } from '../../../ducks/behandlingsgrunnlag';

import PanelHeader from '../../panelHeader/panelHeader';
import Organisasjon from '../arbeidsgiver/organisasjon';
import Arbeidsforholdene from '../arbeidsgiver/arbeidsforhold';
import Inntekt from '../arbeidsgiver/inntekt';

import './arbeidsgivereNorge.css';

const uuid = require('uuid/v4');

export const ArbeidsgivereEnkeltNorge = props => {
  const {
    kilde, organisasjon, arbeidsforholdene, inntektListe, redigerbart, wrapIPanel,
  } = props;

  const seksjoner = (
    <Fragment>
      <Organisasjon organisasjon={organisasjon} redigerbart={redigerbart} className="organisasjonSeksjon" />
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={organisasjon.navn} understrek />
      <Arbeidsforholdene arbeidsforholdene={arbeidsforholdene} />
      <Mui.Undertittel ikon={Ikoner.Inntekt} tekst={KV.Panel.arbeidsforholdRegistrertINorge.undertitler.inntekt} understrek />
      {kilde && <Inntekt inntektListe={inntektListe} />}
    </Fragment>
  );

  const seksjonerWrappetIPanel = (
    <Mui.LesMerPanel
      intro={<Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={organisasjon.navn} />}
      apneTekst="Vis info"
      lukkTekst="Skjul info"
      border
    >
      { seksjoner }
    </Mui.LesMerPanel>
  );

  const seksjonerIkkeWrappetIPanel = (
    <Fragment>
      <Mui.Undertittel ikon={Ikoner.Arbeidsgiver} tekst={organisasjon.navn} />
      { seksjoner }
    </Fragment>
  );

  return (
    <div className="arbeidsgivereEnkeltNorge">
      {
        wrapIPanel ? seksjonerWrappetIPanel : seksjonerIkkeWrappetIPanel
      }
    </div>
  );
};

ArbeidsgivereEnkeltNorge.propTypes = {
  kilde: PT.string,
  organisasjon: MPT.Organisasjon.isRequired,
  arbeidsforholdene: MPT.Arbeidsforholdene.isRequired,
  inntektListe: MPT.InntektListe.isRequired,
  redigerbart: PT.bool.isRequired,
  wrapIPanel: PT.bool,
};

ArbeidsgivereEnkeltNorge.defaultProps = {
  kilde: undefined,
  wrapIPanel: false,
};

export const ArbeidsgivereNorge = props => {
  const {
    arbeidsgivereNorge, redigerbart,
  } = props;

  const wrapIPanel = arbeidsgivereNorge.length > 1;

  return (
    <div className="arbeidsgivereNorge panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader tittel={KV.Panel.arbeidsforholdRegistrertINorge.tittel} />}
        ariaTittel="Panel for arbeidsforhold registrert i Norge"
      >
        {
          arbeidsgivereNorge.map(arbeidsgiver => <ArbeidsgivereEnkeltNorge key={uuid()} {...arbeidsgiver} redigerbart={redigerbart} wrapIPanel={wrapIPanel} />)
        }
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

ArbeidsgivereNorge.propTypes = {
  arbeidsgivereNorge: MPT.ArbeidsgivereNorge.isRequired,
  redigerbart: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  arbeidsgivereNorge: behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
  ekstraArbeidsgivere: behandlingsgrunnlagSelectors.JuridiskArbeidsgiverNorgeSelector(state).ekstraArbeidsgivere,
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});

export default connect(mapStateToProps)(ArbeidsgivereNorge);
