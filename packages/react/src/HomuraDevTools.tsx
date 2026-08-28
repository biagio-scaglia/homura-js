import { useEffect, useRef, ReactElement } from 'react';
import { Homura } from '@homura-js/core';
import { mountDevTools, DevToolsOptions } from '@homura-js/devtools';

export interface HomuraDevToolsProps<T> extends DevToolsOptions {
  homura: Homura<T>;
}

/**
 * React Component wrapper for Homura DevTools.
 */
export function HomuraDevTools<T>({
  homura,
  position = 'floating',
  defaultOpen = false,
  theme = 'dark',
  title = 'HOMURA'
}: HomuraDevToolsProps<T>): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (position === 'embedded' && containerRef.current) {
      const { unmount } = mountDevTools(homura, {
        container: containerRef.current,
        position: 'embedded',
        theme,
        title
      });
      return () => unmount();
    } else {
      const { unmount } = mountDevTools(homura, {
        position: 'floating',
        defaultOpen,
        theme,
        title
      });
      return () => unmount();
    }
  }, [homura, position, defaultOpen, theme, title]);

  if (position === 'embedded') {
    return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />;
  }

  return <></>;
}
