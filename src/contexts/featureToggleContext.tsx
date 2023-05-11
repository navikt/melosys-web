import React, { createContext, useMemo, useState } from "react";

interface FeatureToggleContextProps {
  erInvalidert: boolean;
  invaliderFeatureTokens: () => void;
  validerFeatureTokens: () => void;
}

export const FeatureToggleContext = createContext<FeatureToggleContextProps>({
  erInvalidert: false,
  invaliderFeatureTokens: () => {},
  validerFeatureTokens: () => {},
});

export const FeatureToggleProvider: React.FC = ({ children }) => {
  const [erInvalidert, setErInvalidert] = useState<boolean>(false);

  const contextValue = useMemo(() => {
    return {
      erInvalidert,
      invaliderFeatureTokens: () => setErInvalidert(true),
      validerFeatureTokens: () => setErInvalidert(false),
    };
  }, [erInvalidert]);

  return <FeatureToggleContext.Provider value={contextValue}>{children}</FeatureToggleContext.Provider>;
};
