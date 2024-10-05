import { defineConfig } from 'drizzle-kit';
import type {Config} from 'drizzle-kit'
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
  dbCredentials: {
    url:'todo.db'
  },
} satisfies Config);