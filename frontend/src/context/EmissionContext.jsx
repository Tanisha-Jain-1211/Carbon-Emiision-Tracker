import { createContext, useContext, useState } from "react";

const EmissionContext = createContext();

export const EmissionProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <EmissionContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </EmissionContext.Provider>
  );
};

export const useEmission = () => useContext(EmissionContext);
