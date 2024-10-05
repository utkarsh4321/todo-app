import { drizzle,BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Logger } from 'drizzle-orm/logger';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { logger } from '../utility/logger';

class CustomLogger implements Logger{
    logQuery(query: string, params: unknown[]): void {
        logger.info(`FROM DB ${query} ${params}`)
    }
}

export const connection = new Database('todo.db');
export let db:BetterSQLite3Database<typeof schema> = drizzle(connection,{...schema,logger:new CustomLogger()});





