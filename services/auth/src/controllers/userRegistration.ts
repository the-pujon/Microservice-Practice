import { NextFunction, Request, Response } from "express";
import prisma from "@/prisma";
import { UserCreateSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { EMAIL_SERVICE, USER_SERVICE } from "@/config";


const generateVerificationCode = () => {
  const timestamp = new Date().getTime().toString();

  const randomNum = Math.floor(10+ Math.random() * 90)

  let code = (timestamp + randomNum).slice(-5); // last 5 digits

  return code;
}
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

      console.log("User created in User Service successfully:", user);

      // Verification code generate
    const code = generateVerificationCode();

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code: code,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    console.log("Verification code created successfully:", code);
      //Send verification email

   
      //  await axios.post(`http://localhost:4005/emails/send`, {
      //   recipient: user.email,
      //   subject: "Email Verification",
      //   body: `Your verification code is: ${code}. It will expire in 24 hours.`,
      //   source: "user-registration",
      // });
      // await axios.post(`${EMAIL_SERVICE}/emails/send`, {
      //   recipient: user.email,
      //   subject: "Email Verification",
      //   body: `Your verification code is: ${code}. It will expire in 24 hours.`,
      //   source: "user-registration",
      // });

      await fetch(`${EMAIL_SERVICE}/emails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: user.email,
          subject: "Email Verification",
          body: `Your verification code is: ${code}. It will expire in 24 hours.`,
          source: "user-registration",  
        }),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to send verification email");
          }
          return response.json();
        })
     
     

    return res.status(201).json({
      message: "User registered successfully. Check your email for verification code.",
      user,
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    next(error);
  }
};

export default userRegistration;
