import React from 'react';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import { BOOLSK } from '../../../constants';
import * as MPT from '../../../proptypes';
import * as Ikoner from '../../../resources/images';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as Mui from '../../../felleskomponenter/ui';

import './knyttTilSak.css';

const KnyttTilSak = props => {
  const { sak, behandlingstyper, opprettBehandling } = props;
  const { behandlingOversikter } = sak;
  const sisteBehandling = behandlingOversikter[0];
  const clsElementskrift = { 'border-bottom': 'none' };

  if (sisteBehandling.behandlingsstatus.kode === MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET) {
    return (
      <div className="panelramme">
        <Mui.Elementskrift tekst="Melding om saksbehandlingstid" ikon={Ikoner.InformationCircle} className="elementTittel oversteUndertittel" style={clsElementskrift} />
        <Skjema.RadioGruppe feltNavn="opprettBehandling" label="Knytt til sak">
          <Skjema.Radio feltNavn="opprettBehandling" value={BOOLSK.SANN} label="Opprett ny behandling" />
          <Skjema.Radio feltNavn="opprettBehandling" value={BOOLSK.USANN} label="Uten å opprette behandling" />
        </Skjema.RadioGruppe>
        {
          opprettBehandling() &&
          <Skjema.Select feltNavn="behandlingstype" bredde="fullbredde" label="Velg behandlingstype" emptyFieldDisabled={false}>
            {
              behandlingstyper &&
              behandlingstyper
                .filter(elem => elem.kode !== MKV.Koder.behandlinger.behandlingstyper.SOEKNAD
                  && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_IKKE_YRKESAKTIV
                  && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.VURDER_TRYGDETID
                  && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL
                  && elem.kode !== MKV.Koder.behandlinger.behandlingstyper.ØVRIGE_SED)
                .map(elem => <option key={elem.kode} value={elem.kode}>{elem.term}</option>)
            }
          </Skjema.Select>
        }
      </div>
    );
  }
  return (
    <div className="behandlingspanel">
      <Skjema.Checkbox className="knyttTilSak" feltNavn="ingenVurdering" label="Dokumentet trenger ingen vurdering" />
    </div>
  );
};
KnyttTilSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  opprettBehandling: PT.func.isRequired,
};
KnyttTilSak.defaultProps = {
};
const selector = formValueSelector('journalforing');
const mapStateToProps = state => ({
  opprettBehandling: () => selector(state, 'opprettBehandling'),
});
export default connect(mapStateToProps)(KnyttTilSak);
