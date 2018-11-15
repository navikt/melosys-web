import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MPT from '../../proptypes/';
import * as API from '../../services/api';
import { formatterDatoTilNorsk } from '../../utils/dato';
import * as Ikoner from '../../resources/images/index';
import './sideDialogDokumenter.css';
import * as fagsakSelectors from '../../ducks/fagsaker/selectors';

const uuid = require('uuid/v4');

const RenderInnUtImage = ({ mottaksretning }) => {
  const { kode, term } = mottaksretning;
  let icon;
  switch (kode) {
    case 'INN':
      icon = Ikoner.InnBrev;
      break;
    case 'UT':
      icon = Ikoner.Svar;
      break;
    default:
      icon = Ikoner.Svar;
      break;
  }
  return (
    <img src={icon} alt={term} />
  );
};
RenderInnUtImage.propTypes = {
  mottaksretning: MPT.Kodeverk.isRequired,
};
const RenderVedleggLink = ({ dokument }) => {
  const { tittel } = dokument;
  return (
    <div>
      <img src={Ikoner.Binders} alt="Vedlegg" /><a href="#">{tittel}</a>
    </div>
  );
};
RenderVedleggLink.propTypes = {
  dokument: PT.shape({
    dokumentID: PT.string,
    tittel: PT.string.isRequired,
    mottattDato: PT.string,
  }),
};
RenderVedleggLink.defaultProps = {
  dokument: {
    dokumentID: null,
    mottattDato: null,
  },
};
const RenderOversiktRad = ({ oversikt }) => {
  console.log(oversikt);
  const {
    mottaksretning, addressat, dokument, vedlegg,
  } = oversikt;
  return (
    <tr>
      <td><RenderInnUtImage mottaksretning={mottaksretning} /></td>
      <td>
        <span>
          <a href="#">Vedtaksbrev</a>
          { vedlegg.map(vedleggDokument => <RenderVedleggLink key={uuid()} dokument={vedleggDokument} />) }
        </span>
      </td>
      <td>{addressat}</td>
      <td>{formatterDatoTilNorsk(dokument.mottattDato, false)}</td>
    </tr>
  );
};
RenderOversiktRad.propTypes = {
  oversikt: PT.shape({
    mottaksretning: MPT.Kodeverk.isRequired,
    addressat: PT.string.isRequired,
    dokument: PT.shape({
      dokumentID: PT.string.isRequired,
      tittel: PT.string.isRequired,
      mottattDato: PT.string.isRequired,
    }),
    vedlegg: PT.arrayOf(PT.shape({
      dokumentID: PT.string,
      tittel: PT.string.isRequired,
      mottattDato: PT.string,
    })),
  }),
};
RenderOversiktRad.defaultProps = {
  oversikt: {
    vedlegg: [],
  },
};

class SideDialogDokumenter extends Component {
  state = { oversiktDokumenter: [] };

  async componentDidMount() {
    const { oppsummering: { saksnummer } } = this.props;
    await this.hentDokumentOversikt(saksnummer);
  }

  settOversikt = oversiktDokumenter => this.setState({ oversiktDokumenter });

  hentDokumentOversikt = async snr => {
    const oversiktDokumenter = await API.Dokumenter.hentOversiktDokumenter(snr);
    this.settOversikt(oversiktDokumenter);
    console.log('oversiktDokumenter', oversiktDokumenter);
  };
  render() {
    return (
      <div className="sideDialogDokumenter">
        <table width="100%">
          <thead>
            <tr>
              <th>inn/ut</th>
              <th>Dokument</th>
              <th>Avsender/mottaker</th>
              <th>Dato</th>
            </tr>
          </thead>
          <tbody>
            { this.state.oversiktDokumenter.map(oversikt => <RenderOversiktRad key={uuid()} oversikt={oversikt} />) }
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SideDialogDokumenter);
