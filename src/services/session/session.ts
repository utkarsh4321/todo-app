import { sql } from "drizzle-orm";
import { db } from "../../../db/db";
import { sessionsTable } from "./model";
import { v4 as uuid } from "uuid";

export class SessionStore {
  constructor(public expireTime: number = 0) {
    this.expireTime =
      (typeof process.env.SESSION_EXPIRE_TIME === "string" &&
        Number(process.env.SESSION_EXPIRE_TIME)) ||
      0;
    // this.startInterval();
  }
  startInterval() {
    setInterval(this.clearCookies, 900000);
  }
  async addSession(id: number) {
    const sessionId = uuid();
    const obj = {
      userId: id,
    };
    const now = new Date().toISOString();
    try {
      const insertedUser = await db
        .insert(sessionsTable)
        .values({
          id: sessionId,
          sessionData: JSON.stringify(obj),
          expires: now,
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
  async getSession(sessId: string) {
    const sessionData = await db
      .select()
      .from(sessionsTable)
      .where(sql`${sessionsTable.id} = ${sessId}`);
    if (sessionData.length > 0) {
      const userId = sessionData;
      return userId;
    } else {
      return null;
    }
  }
}
