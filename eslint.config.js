import globals from 'globals';
import pluginJs from '@eslint/js';
import prettier from 'eslint-config-prettier'; // Configuración de Prettier
import prettierPlugin from 'eslint-plugin-prettier'; // Plugin de Prettier

export default [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      prettier: prettierPlugin, // Registrar el plugin
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prettier/prettier': 'error', // Habilitar Prettier como regla
    },
  },
  pluginJs.configs.recommended, // Configuración recomendada del plugin
  prettier, // Añadir configuración de Prettier directamente al array
];
