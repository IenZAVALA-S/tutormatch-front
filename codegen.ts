import type { CodegenConfig } from '@graphql-codegen/cli'

// Tipos generados desde el esquema del BFF (no escribirlos a mano).
// Por defecto lee el esquema del BFF corriendo en local (`npm run start:dev` en su repo).
// Se puede apuntar a otro lado con CODEGEN_SCHEMA, por ejemplo al `schema.gql` del BFF:
//   CODEGEN_SCHEMA=../BFF-TutorMatch/src/schema.gql npm run codegen
const config: CodegenConfig = {
  schema: process.env.CODEGEN_SCHEMA ?? 'http://localhost:3000/graphql',
  documents: ['src/**/*.{ts,tsx}', '!src/gql/**/*'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      // Sin enmascarar fragmentos: los tipos de un fragmento se usan tal cual.
      presetConfig: { fragmentMasking: false },
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        scalars: { DateTime: 'string' },
      },
    },
  },
}

export default config
