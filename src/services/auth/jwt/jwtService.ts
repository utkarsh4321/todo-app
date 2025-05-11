import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { db } from "../../../db/db";
import { tokenTable } from "./model";

class TokenService {
  constructor(private secretKey: string = process.env.SESSION_SECRET!) {
    this.secretKey = secretKey;
  }
  createToken<T>(payload: T, expireTime: number): string {
    const token = jwt.sign(payload as object, this.secretKey, {
      expiresIn: expireTime,
    });
    return token;
  }
  verifyToken(token: string): JwtPayload | string | null {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      return decoded;
    } catch (err) {
      console.log("error occured during token decode");
    }
    return null;
  }
  async saveToken(
    token: string,
    userId: number,
    id: string
  ): Promise<{ tokenId: string } | null> {
    try {
      const insertedToken = await db
        .insert(tokenTable)
        .values({
          id: id,
          userId: userId,
          refreshToken: token,
        })
        .returning();
      if (insertedToken.length > 0) {
        return { tokenId: insertedToken[0].id };
      }
    } catch (err: any) {
      throw new Error(err);
    }
    return null;
  }
  async deleteToken(tokenId: number): Promise<boolean> {
    try {
      const tokenData = await db
        .select()
        .from(tokenTable)
        .where(sql`${tokenTable.id} = ${tokenId}`);
      if (tokenData?.length > 0) {
        const deletedData = await db
          .delete(tokenTable)
          .where(sql`${tokenTable.id} = ${tokenId}`)
          .returning();
        if (deletedData.length > 0) {
          return true;
        }
      }
    } catch (err: any) {
      throw new Error(err);
    }
    return false;
  }
  async getToken(tokenId: number): Promise<string | null> {
    try {
      const tokenData = await db
        .select()
        .from(tokenTable)
        .where(sql`${tokenTable.id} = ${tokenId}`);
      if (tokenData.length > 0) {
        return tokenData[0].refreshToken;
      }
    } catch (err: any) {
      throw new Error(err);
    }
    return null;
  }
}
export const tokenService = new TokenService();
