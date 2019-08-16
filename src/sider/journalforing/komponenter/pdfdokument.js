/* eslint react/no-multi-comp:off */
import React, { Component } from 'react';
import PT from 'prop-types';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import * as Utils from '../../../utils';
import * as Api from '../../../services/api';

import './pdfdokument.css';

const uuid = require('uuid/v4');

/** For å oppnå full bredde innenfor div-kontainer må
 * vi plassere PDF-komponenten(pdf-js) i en wrapper siden pdf-js ikke støtter prosentvis bredde (kun px).
 * Parent vil da kunne finne bredden i sin egen div og sende den inn til PDFViser.
 */
class PDFViser extends Component {
  state = {};

  onLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  render() {
    const { numPages } = this.state;
    const { pdfDokument } = this.props;
    const pageArray = new Array(numPages).fill(null);

    return (
      <div className="pdfviser">
        <Document
          file={pdfDokument}
          onLoadSuccess={this.onLoadSuccess}
        >
          { pageArray.map((item, index) => (
            <div key={uuid()} id={`section-${index + 1}`} className="pdfviser__side">
              <Page width={this.props.wrapperDivSize} pageNumber={index + 1} />
              <div className="pdfviser__sideinfo">side {index + 1} av { pageArray.length}</div>
            </div>
          ))}
        </Document>
      </div>
    );
  }
}

PDFViser.propTypes = {
  pdfDokument: PT.string.isRequired,
  wrapperDivSize: PT.number,
};

PDFViser.defaultProps = {
  wrapperDivSize: 0,
};

/**
 * Dette er hovedkomponenten som eksponeres utenfor pakken. Den wrapper inn
 * PDFLeser lenger opp, men sørger også for å finne korrekt bredde av containeren
 * via eventlisteners ved mount.
 */
class PDFDokument extends Component {
  state = { width: null };

  componentDidMount () {
    this.setDivSize();
    window.addEventListener('resize', this.setDivSizeThrottled);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { journalpostID, dokumentID } = this.props;
    const { width } = this.state;
    return ((journalpostID !== nextProps.journalpostID) || (dokumentID !== nextProps.dokumentID) || (width !== nextState.width));
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.setDivSizeThrottled);
  }

  setDivSize = () => {
    const width = this.pdfWrapper && this.pdfWrapper.getBoundingClientRect().width;
    this.setState({ width });
  };

  setDivSizeThrottled = Utils._throttle(this.setDivSize, 500);

  render() {
    const { journalpostID, dokumentID } = this.props;
    const pdfDokumentURI = Api.Dokumenter.pdf.uriPath(journalpostID, dokumentID);
    return (
      <div
        id="row"
        className="pdfdokument">
        <div id="pdfWrapper" className="dokument__pdfwrapper" ref={ref => { this.pdfWrapper = ref; }}>
          <PDFViser wrapperDivSize={this.state.width} pdfDokument={pdfDokumentURI} />
        </div>
      </div>
    );
  }
}

PDFDokument.propTypes = {
  journalpostID: PT.string.isRequired,
  dokumentID: PT.string.isRequired,
};

export default PDFDokument;
