import React from 'react';

const KnyttTilSak = () => {
  const clsBehandlingsPanel = {
    background: 'lightgray',
    border: '1px solid #b7b1a9',
    borderRadius: '3px',
    margin: '0.5em 0',
    padding: '0.5em',
  };

  return (
    <div style={clsBehandlingsPanel}>Knytt til sak panel</div>
  );
};

export default KnyttTilSak;
