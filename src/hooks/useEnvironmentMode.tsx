import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type EnvironmentMode = 'test' | 'production';

interface EnvironmentModeContextType {
  mode: EnvironmentMode;
  setMode: (mode: EnvironmentMode) => void;
  toggleMode: () => void;
  isTestMode: boolean;
  isProductionMode: boolean;
}

const EnvironmentModeContext = createContext<EnvironmentModeContextType | undefined>(undefined);

export function EnvironmentModeProvider({ children }: { children: ReactNode }) {
  // Load mode from localStorage or default to 'test'
  const [mode, setModeState] = useState<EnvironmentMode>(() => {
    const saved = localStorage.getItem('klyr-environment-mode');
    return (saved === 'production' ? 'production' : 'test') as EnvironmentMode;
  });

  // Persist mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('klyr-environment-mode', mode);
  }, [mode]);

  const setMode = (newMode: EnvironmentMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(prev => prev === 'test' ? 'production' : 'test');
  };

  const value = {
    mode,
    setMode,
    toggleMode,
    isTestMode: mode === 'test',
    isProductionMode: mode === 'production',
  };

  return (
    <EnvironmentModeContext.Provider value={value}>
      {children}
    </EnvironmentModeContext.Provider>
  );
}

export function useEnvironmentMode() {
  const context = useContext(EnvironmentModeContext);
  if (context === undefined) {
    throw new Error('useEnvironmentMode must be used within an EnvironmentModeProvider');
  }
  return context;
}

