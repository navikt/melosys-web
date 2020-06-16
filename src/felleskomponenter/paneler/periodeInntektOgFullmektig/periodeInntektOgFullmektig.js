import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../../felleskomponenter/ui';
import * as Ikoner from '../../../resources/images';
import * as KV from '../../../kodeverk';

import PanelHeader from '../../panelHeader/panelHeader';
import Soknadsperiode from './soknadsperiode';
import Inntektutland from './inntektutland';
import Fullmektige from './fullmektige';

import './periodeInntektOgFullmektig.css';

const PeriodeInntektOgFullmektig = ({
  lagreSoknadOgOppfriskSaksopplysninger,
}) => (
  <div className="periodeInntektOgFullmektig panelSeksjon">
    <Nav.EkspanderbartpanelBase
      heading={<PanelHeader tittel={KV.Panel.periodeInntektOgFullmektig.tittel} />}
      ariaTittel="Panel for periode, inntekt og fullmektig">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12">
            <Mui.Undertittel ikon={Ikoner.Calendar} tekst={KV.Panel.periodeInntektOgFullmektig.undertitler.soknadsPeriode} className="undertittel" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Soknadsperiode lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger} />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Mui.Undertittel ikon={Ikoner.Inntekt} tekst={KV.Panel.periodeInntektOgFullmektig.undertitler.inntektUnderOpphold} className="undertittel inntektTittel" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Inntektutland />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Mui.Undertittel ikon={Ikoner.AccountCircle} tekst={KV.Panel.periodeInntektOgFullmektig.undertitler.fullmektig} className="undertittel fullmektigTittel" />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            <Fullmektige />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </Nav.EkspanderbartpanelBase>
  </div>
);

PeriodeInntektOgFullmektig.propTypes = {
  lagreSoknadOgOppfriskSaksopplysninger: PT.func.isRequired,
};

PeriodeInntektOgFullmektig.defaultProps = {};

export default PeriodeInntektOgFullmektig;
