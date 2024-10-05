import {migrate} from 'drizzle-orm/better-sqlite3/migrator';
import { db,connection } from './db';

(async()=>{
    await migrate(db,{migrationsFolder:'./drizzle'});
    await connection.close();
})()



