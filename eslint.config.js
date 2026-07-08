import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import globals from 'globals';

export default withVueTs(
  {
    ignores: ['src/bff-types/**', 'dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  skipFormatting
);