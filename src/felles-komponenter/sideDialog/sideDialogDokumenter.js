import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import * as MPT from '../../proptypes/';
import * as API from '../../services/api';
import { formatterDatoTilNorsk } from '../../utils/dato';
import * as Ikoner from '../../resources/images/index';
import * as fagsakSelectors from '../../ducks/fagsaker/selectors';

import './sideDialogDokumenter.css';

const uuid = require('uuid/v4');

const PdfLink = ({ journalpostID, dokumentID, tittel }) => {
  const link = `/api/dokumenter/pdf/${journalpostID}/${dokumentID}`;
  return (
    <a href={link} rel="noopener noreferrer" target="_blank">{tittel}</a>
  );
};
PdfLink.propTypes = {
  journalpostID: PT.string.isRequired,
  dokumentID: PT.string.isRequired,
  tittel: PT.string.isRequired,
};

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
const RenderVedleggLink = ({ journalpostID, dokument }) => {
  const { tittel, dokumentID } = dokument;
  return (
    <div>
      <img src={Ikoner.Binders} alt="Vedlegg" />&nbsp;
      { dokumentID && <PdfLink journalpostID={journalpostID} dokumentID={dokumentID} tittel={tittel} /> }
      { !dokumentID && <span>{tittel}</span> }
    </div>
  );
};
RenderVedleggLink.propTypes = {
  journalpostID: PT.string.isRequired,
  dokument: MPT.DokumentNullable,
};
RenderVedleggLink.defaultProps = {
  dokument: {
    dokumentID: null,
  },
};

const VelgDato = (mottaksretning, mottattDato, journalforingDato) => {
  let valgtDato = null;
  if (mottaksretning.kode === 'INN' && mottattDato) {
    valgtDato = formatterDatoTilNorsk(mottattDato, false);
  }
  if (mottaksretning.kode === 'UT' && journalforingDato) {
    valgtDato = formatterDatoTilNorsk(journalforingDato, false);
  }
  return valgtDato;
};

const RenderOversiktRad = ({ oversikt }) => {
  if (!oversikt) return null;
  const {
    mottaksretning, avsenderEllerMottaker, journalpostID, mottattDato, journalforingDato, hoveddokument, vedlegg,
  } = oversikt;
  const { dokumentID, tittel } = hoveddokument;
  if (!dokumentID) return null;
  return (
    <tr>
      <td><RenderInnUtImage mottaksretning={mottaksretning} /></td>
      <td>
        <span>
          <PdfLink journalpostID={journalpostID} dokumentID={dokumentID} tittel={tittel} />
          { vedlegg.map(vedleggDokument => <RenderVedleggLink key={uuid()} journalpostID={journalpostID} dokument={vedleggDokument} />) }
        </span>
      </td>
      <td>{avsenderEllerMottaker}</td>
      <td>{VelgDato(mottaksretning, mottattDato, journalforingDato)}</td>
    </tr>
  );
};
RenderOversiktRad.propTypes = {
  oversikt: PT.shape({
    mottaksretning: MPT.Kodeverk.isRequired,
    avsenderEllerMottaker: PT.string.isRequired,
    mottattDato: PT.string,
    journalforingDato: PT.string,
    journalpostID: PT.string,
    hoveddokument: MPT.Dokument,
    vedlegg: MPT.Vedlegg,
  }),
};
RenderOversiktRad.defaultProps = {
  oversikt: {
    mottattDato: null,
    journalforingDato: null,
    vedlegg: [],
  },
};

class SideDialogDokumenter extends Component {
  state = { oversiktDokumenter: [] };

  async componentDidUpdate(prevProps) {
    const { oppsummering: { saksnummer: prevSaksnummer } } = prevProps;
    const { oppsummering: { saksnummer } } = this.props;

    if (prevSaksnummer !== saksnummer) {
      await this.hentDokumentOversikt(saksnummer);
    }
  }

  settOversikt = oversiktDokumenter => this.setState({ oversiktDokumenter });

  hentDokumentOversikt = async snr => {
    const oversiktDokumenter = await API.Dokumenter.hentOversiktDokumenter(snr);
    this.settOversikt(oversiktDokumenter);
  };
  render() {
    return (
      <div className="sideDialogDokumenter">
        <table width="100%" className="dokumentTabell" aria-label="Liste over dokumenter knyttet til saken">
          <thead>
            <tr>
              <th />
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
