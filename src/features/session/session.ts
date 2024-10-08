import { sql } from "drizzle-orm";
import { db } from "../../db/db";
import { sessionsTable } from "./model";
import { v4 as uuid } from "uuid";

export class SessionStore {
  constructor(public expireTime: number = 0) {
    this.expireTime = 1000 * 60;
    // this.startInterval();
  }
  startInterval() {
    setInterval(this.clearCookies, 900000);
  }
  async addSession(id: number, cookieAge: number) {
    const sessionId = uuid();
    const obj = {
      userId: id,
      maxAge: cookieAge,
    };
    const now = new Date().getTime();
    const expire = new Date(now + this.expireTime).toISOString();
    // async function storeInDb() {
    try {
      const insertedUser = await db
        .insert(sessionsTable)
        .values({
          id: sessionId,
          sessionData: JSON.stringify(obj),
          expires: expire,
        })
        .returning();
      if (insertedUser.length > 0) {
        return insertedUser[0].id;
      }
    } catch (err: any) {
      throw new Error(err);
    }

    // }
    // storeInDb()
  }
  async destory(sessionId: string) {
    const sessionData = await db
      .select()
      .from(sessionsTable)
      .where(sql`${sessionsTable.id} = ${sessionId}`);
    if (sessionData?.length > 0) {
      await db
        .delete(sessionsTable)
        .where(sql`${sessionsTable.id} = ${sessionId}`);
    }
  }
  async clearCookies(sessionId: string) {
    await db
      .delete(sessionsTable)
      .where(
        sql`${sessionsTable.id} = ${sessionId} and datetime('now') > datetime(${sessionsTable.expires})`
      );
  }
}
