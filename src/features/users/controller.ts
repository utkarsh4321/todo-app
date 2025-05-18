import { eq, sql } from "drizzle-orm";
import {
  api200ResponseHandler,
  api201ResponseHandler,
} from "../../utility/apiResponseHandler";
import { tAsyncHandler } from "../../utility/asyncHandler";
import {
  api400errorhandler,
  api500errorhandler,
} from "../../utility/baseErrorHandler";
import { User, users } from "./model";
import { db } from "../../db/db";
import { comparePassword, hashPassword, insertUser } from "./userDbMethods";
import { tokenService } from "../../services/auth/jwt/jwtService";
import { v4 as uuid } from "uuid";

export const registerUser = tAsyncHandler(async (req, res, next) => {
  if (!req.userId) {
    const { email, password, name }: User = req.body;
    if (!email || !password || !name) {
      throw new api400errorhandler("name, email and password is required");
    }
    const storedUser = (
      await db
        .select()
        .from(users)
        .where(sql`${users.email} = ${email} or ${users.name} = ${name}`)
    ).at(0);
    if (
      storedUser &&
      typeof storedUser == "object" &&
      Object.keys(storedUser).length > 0
    ) {
      console.log(storedUser);
      throw new api400errorhandler("user already present");
    } else {
      const hashedPassword = await hashPassword(password);
      if (typeof hashedPassword === "string") {
        const insertedUser = await insertUser({
          email,
          name,
          password: hashedPassword,
        });
        console.log(insertedUser, "User inserted in DB");
        if (insertedUser && insertedUser.length > 0)
          return res.status(201).json({
            ...new api201ResponseHandler("user created successfully", []),
          });
      }
    }
  } else {
    return res.status(200).json({
      message: "user already logined",
      success: false,
    });
  }
});

export const loginUser = tAsyncHandler(async (req, res, next) => {
  if (!req.userId) {
    const { email, password }: User = req.body;
    if (!email || !password) {
      throw new api400errorhandler("email and password required");
    }
    const storedUser = (
      await db.select().from(users).where(eq(users.email, email))
    ).at(0);
    if (
      storedUser &&
      typeof storedUser === "object" &&
      Object.keys(storedUser).length > 0
    ) {
      const isPasswordCorrect = await comparePassword(
        password,
        storedUser.password
      );
      if (isPasswordCorrect) {
        // |-----session creation logic here-----|
        // const sessId = await req.customSession?.addSession(storedUser.id);
        // if (sessId) {
        //   res.cookie("mysession", sessId, {
        //     // maxAge: 1000 * 60, // to set the max life of cookies
        //     httpOnly: true,
        //     signed: true,
        //   });
        //   if (req.customSession) req.customSession.userId = storedUser.id;
        // }
        // return res.status(200).json({
        //   ...new api200ResponseHandler("login successfully", {
        //     userId: storedUser.id,
        //   }),
        // });
        // |-----JWT Token logic Here-----|
        const accessTokenExpireTime =
          (process.env.ACCESS_TOKEN_EXPIRE_TIME &&
            +process.env.ACCESS_TOKEN_EXPIRE_TIME) ||
          0;
        const refreshTokenExpireTime =
          (process.env.REFRESH_TOKEN_EXPIRE_TIME &&
            +process.env.REFRESH_TOKEN_EXPIRE_TIME) ||
          0;
        const tokenId = uuid();
        const accessToken = tokenService.createToken<{
          userId: number;
          email: string;
        }>(
          {
            userId: storedUser.id,
            email: storedUser.email,
          },
          accessTokenExpireTime / 1000
        );
        const refreshToken = tokenService.createToken<{
          userId: number;
          tokenId: string;
        }>(
          {
            userId: storedUser.id,
            tokenId: tokenId,
          },
          refreshTokenExpireTime / 1000
        );

        // const refreshTokenId = await tokenService.saveToken(
        //   refreshToken,
        //   storedUser.id,
        //   tokenId
        // );
        // if (refreshTokenId?.tokenId) {
        res.cookie("access_token", accessToken, {
          httpOnly: true,
          signed: true,
          maxAge: accessTokenExpireTime,
          // path: "/api/v1/user/refresh",
          // sameSite:'strict'
        });
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          signed: true,
          maxAge: refreshTokenExpireTime,
          path: "/api/v1/user",
          // sameSite:'strict'
        });
        return res.status(200).json({
          ...new api200ResponseHandler("login successfully", {
            userId: storedUser.id,
            email: storedUser.email,
          }),
        });
        // } else {
        // return res.status(500).json({
        //   ...new api500errorhandler("Failed to save refresh token"),
        // });
        // }
      } else {
        return res.status(401).json({
          message: "Invalid email or password.",
          success: false,
        });
      }
    } else {
      return res.status(401).json({
        message: "Invalid email or password.",
        success: false,
      });
    }
  } else {
    return res.status(200).json({
      message: "user already logined",
      success: false,
    });
  }
});

export const refreshToken = tAsyncHandler(async (req, res, next) => {
  if (req.signedCookies && req.signedCookies?.refresh_token) {
    const refreshToken = req.signedCookies.refresh_token;
    const varifiedRefreshToken = tokenService.verifyToken(refreshToken);
    if (
      varifiedRefreshToken &&
      typeof varifiedRefreshToken !== "string" &&
      varifiedRefreshToken.exp
    ) {
      const storedUser = (
        await db
          .select()
          .from(users)
          .where(eq(users.id, varifiedRefreshToken.userId))
      ).at(0);
      if (storedUser) {
        // await tokenService.deleteToken(varifiedRefreshToken.tokenId);
        const accessTokenExpireTime =
          (process.env.ACCESS_TOKEN_EXPIRE_TIME &&
            +process.env.ACCESS_TOKEN_EXPIRE_TIME) ||
          0;
        const refreshTokenExpireTime =
          (process.env.REFRESH_TOKEN_EXPIRE_TIME &&
            +process.env.REFRESH_TOKEN_EXPIRE_TIME) ||
          0;
        const tokenId = uuid();
        const accessToken = tokenService.createToken<{
          userId: number;
          email: string;
        }>(
          {
            userId: storedUser.id,
            email: storedUser.email,
          },
          accessTokenExpireTime / 1000
        );
        const refreshToken = tokenService.createToken<{
          userId: number;
          tokenId: string;
        }>(
          {
            userId: storedUser.id,
            tokenId: tokenId,
          },
          refreshTokenExpireTime / 1000
        );
        // const refreshTokenId = await tokenService.saveToken(
        //   refreshToken,
        //   storedUser.id,
        //   tokenId
        // );
        // if (refreshTokenId?.tokenId) {
        // res.clearCookie("refresh_token");
        res.cookie("access_token", accessToken, {
          httpOnly: true,
          signed: true,
          maxAge: accessTokenExpireTime,
          // path: "/api/v1/user/refresh",
          // sameSite:'strict'
        });
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          signed: true,
          maxAge: refreshTokenExpireTime,
          path: "/api/v1/user",
          // sameSite:'strict'
        });
        return res.status(200).json({
          ...new api200ResponseHandler("login successfully", {
            userId: storedUser.id,
            email: storedUser.email,
          }),
        });
        // } else {
        //   return res.status(500).json({
        //     ...new api500errorhandler("Failed to save refresh token"),
        //   });
        // }
      }
    } else {
      return res.status(401).json({
        message: "unauthorized access",
        success: false,
      });
    }
    // if (varifiedRefreshToken && typeof varifiedRefreshToken !== 'string' && varifiedRefreshToken.exp) {
    //    const currenTime = Math.floor(Date.now() / 1000);
    //   if (currenTime < varifiedRefreshToken?.exp) {
    //     const isTokenStored = await tokenService.getToken(varifiedRefreshToken.userId);
    //     if(isTokenStored && isTokenStored.length > 0){
    //       const storedUser = (
    //   await db.select().from(users).where(eq(users.id, varifiedRefreshToken.userId))
    // ).at(0);
    // if(storedUser){
    //   await tokenService.deleteToken(varifiedRefreshToken.userId);

    // }
    //     }
    //   }
    // }
  } else {
    return res.status(401).json({
      message: "unauthorized access",
      success: false,
    });
  }
});

export const logout = tAsyncHandler(async (req, res, next) => {
  if (req.signedCookies?.refresh_token && req.signedCookies?.access_token) {
    res.clearCookie("refresh_token", {
      path: "/api/v1/user",
    });
    res.clearCookie("access_token");
    return res.status(200).json({
      ...new api200ResponseHandler("logout successfully"),
    });
  }
  return res.status(401).json({
    message: "unauthorized access",
    success: false,
  });
});
