import { Document } from 'react-pdf';

import React, { Component } from 'react';
import PT from 'prop-types';
import DialogVindu from './dialogVindu';

class DialogvinduPdf extends Component {
  render() {
    const { pdfData } = this.props;

    return (
      <DialogVindu>
        <Document file={pdfData} />
      </DialogVindu>
    );
  }
}

DialogvinduPdf.propTypes = {
  pdfData: PT.object.isRequired,
};

export default DialogvinduPdf;
