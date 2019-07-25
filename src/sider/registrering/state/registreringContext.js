import React from 'react';
import { connectCustomContext, useCustomContext } from '../../../utils/customContext';

const RegistreringContext = React.createContext({});

const useRegistreringContext = () => useCustomContext(RegistreringContext);

const connectRegistreringContext = (stateToProps, dispatchToProps) => component => props =>
  connectCustomContext(stateToProps, dispatchToProps)(component)(props)(RegistreringContext);

export const Context = RegistreringContext;
export const useContext = useRegistreringContext;
export const connect = connectRegistreringContext;
