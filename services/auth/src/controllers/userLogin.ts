import bcrypt from "bcryptjs";
import prisma from "@/prisma";
import { UserLoginSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@prisma/client";


type LoginHistory = {
    userId: string;
    ipAddress: string | undefined;
    userAgent: string | undefined;
    attempt: LoginAttempt;
}

const createLoginHistory = async (info: LoginHistory) => {
  try {
    await prisma.loginHistory.create({
      data: {
        userId: info.userId,
        ipAddress: info.ipAddress || "",
        userAgent: info.userAgent || "",
        attempt: info.attempt,
      },
    });
  } catch (error) {
    console.log(error);
  }
};


const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.ip || "";
    const userAgent = req.headers["user-agent"] || "";

    //validate request body
    const parseBody = UserLoginSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({
        errors: parseBody.error.errors,
      });
    }

    //check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!user) {
    await createLoginHistory({
        userId: "Guest",
        ipAddress: ip as string,
        userAgent: userAgent as string,
        attempt: "FAILED",
    })

      return res.status(404).json({
        message: "Invalid Credentials",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      parseBody.data.password,
      user.password
    );
    if (!isMatch) {

    await createLoginHistory({
        userId: user.id,
        ipAddress: ip as string,
        userAgent: userAgent as string,
        attempt: "FAILED",
    })
      return res.status(404).json({
        message: "Invalid Credentials",
      });
    }

    //check if user is verified
    if (!user.verified) {
      return res.status(403).json({
        message: "User not verified",
      });
    }

    //check if the user is active
    if (user.status !== "ACTIVE") {
    await createLoginHistory({
        userId: user.id,
        ipAddress: ip as string,
        userAgent: userAgent as string,
        attempt: "FAILED",
    })
      return res.status(403).json({
        message: `Your account is ${user.status.toLowerCase()}`,
      });
    }

    //generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    //create login history
    await createLoginHistory({
        userId: user.id,
        ipAddress: ip as string,
        userAgent: userAgent as string,
        attempt: "SUCCESS",
    })

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


export default userLogin;