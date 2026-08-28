import { App, InjectionKey } from 'vue';
import { Homura } from '@homura-js/core';

export const HOMURA_KEY: InjectionKey<Homura<any>> = Symbol('HOMURA_STORE');

export interface HomuraPluginOptions<T> {
  homura: Homura<T>;
}

/**
 * Vue 3 Plugin to provide Homura instance globally.
 */
export function createHomuraPlugin<T>(homura: Homura<T>) {
  return {
    install(app: App): void {
      app.provide(HOMURA_KEY, homura);
      app.config.globalProperties.$homura = homura;
    }
  };
}
