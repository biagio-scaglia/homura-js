import { createContext, useContext, ReactNode, ReactElement } from 'react';
import { Homura } from '@homura-js/core';

const HomuraContext = createContext<Homura<any> | null>(null);

export interface HomuraProviderProps<T> {
  homura: Homura<T>;
  children: ReactNode;
}

/**
 * Provider component to make a Homura instance available throughout the React tree.
 */
export function HomuraProvider<T>({
  homura,
  children
}: HomuraProviderProps<T>): ReactElement {
  return (
    <HomuraContext.Provider value={homura}>
      {children}
    </HomuraContext.Provider>
  );
}

/**
 * Hook to retrieve the Homura instance from React context.
 */
export function useHomuraInstance<T>(): Homura<T> {
  const context = useContext(HomuraContext);
  if (!context) {
    throw new Error('useHomuraInstance must be used within a <HomuraProvider>');
  }
  return context as Homura<T>;
}
