import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import { UserCreateSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { USER_SERVICE } from "@/config";

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //parse the request body using the UserCreateSchema
    //if the parsing fails, return a 400 status code with the error messages
    const parseBody = UserCreateSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.errors });
    }

    //check if the user already exists in the database
    //if the user exists, return a 400 status code with a message
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(parseBody.data.password, salt);

    //create the auth user
    const user = await prisma.user.create({
      data: {
        ...parseBody.data,
        password: hashPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        verified: true,
      },
    });

    console.log("User created successfully:", user);

    axios
      .post(`${USER_SERVICE}/users`, {
        authUserId: user.id,
        name: user.name,
        email: user.email,
      })
      .then((response) => {
        console.log(response.data);
      });

      // TODO: Verification code generate
      // TODO: Send verification email

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
