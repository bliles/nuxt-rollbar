import { defu } from 'defu';
import { addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit';
import { name, version } from '../package.json';
import type Rollbar from 'rollbar';

export interface ModuleOptions {
  /**
   * @description
   *  Rollbar client access token.
   *  If not provided rollbar will not be enabled on the client side;
   */
  clientAccessToken: string;
  /**
   * @description
   *  Rollbar server access token.
   *  If not provided rollbar will not be enabled on the server side;
   */
  serverAccessToken: string;
  /**
   * @description
   *  Plugin mode.
   *
   * @default 'all'
   */
  mode?: 'client' | 'server' | 'all';
  /**
   * @description
   * Rollbar configuration options.
   */
  config?: Omit<Rollbar.Configuration, 'accessToken'>;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'rollbar',
    compatibility: {
      nuxt: '^3',
    },
  },
  defaults: {
    serverAccessToken: '',
    clientAccessToken: '',
    mode: 'all',
    config: {},
  },
  setup({ serverAccessToken, mode, ...options }, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.runtimeConfig.__rollbarServerAccessToken = serverAccessToken;
    nuxt.options.runtimeConfig.public.rollbar = defu(
      nuxt.options.runtimeConfig.public.rollbar,
      options,
    );

    nuxt.options.build.transpile.push(resolve('runtime'));

    addImports([
      {
        name: 'useRollbar',
        as: 'useRollbar',
        from: resolve('runtime/composables/useRollbar'),
      },
    ]);

    addPlugin({ src: resolve('runtime/plugin'), mode });
  },
});