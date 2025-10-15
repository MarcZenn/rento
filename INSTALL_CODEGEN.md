# GraphQL Code Generator Installation

To complete the GraphQL codegen setup, install the required packages:

```bash
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

After installation:

1. **Generate types for the first time:**
   ```bash
   npm run codegen
   ```

2. **Verify the generated file:**
   ```bash
   ls -la shared/types/graphql.ts
   ```

3. **Run in watch mode during development:**
   ```bash
   npm run codegen:watch
   ```

## What Gets Installed

- `@graphql-codegen/cli` - Main codegen CLI tool
- `@graphql-codegen/typescript` - Base TypeScript types from schema
- `@graphql-codegen/typescript-resolvers` - Type-safe resolver signatures
- `@graphql-codegen/typescript-operations` - Types for queries/mutations (when you add .graphql files)
- `@graphql-codegen/typescript-react-apollo` - Apollo React hooks (optional, for later)

## Next Steps

After installation and first generation:

1. Update server resolvers to use generated types from `@shared/types/graphql`
2. Update Apollo client queries to use generated types
3. Add codegen to your CI/CD pipeline to ensure types are always up-to-date
4. Delete this file once installation is complete

## Troubleshooting

If you get module resolution errors, make sure:
- Your `tsconfig.json` paths are configured correctly
- You're using the right TypeScript version (5.8.3+)
- Run `npm run codegen` after any schema changes
