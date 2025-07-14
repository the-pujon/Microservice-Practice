import prisma from "@/prisma";
import { EmailVerificationSchema } from "@/schemas";
import axios from "axios";

const verifyEmail = async (req, res) =>{
    try{

        //parsing the request body using EmailVerificationSchema
        const parseBody = EmailVerificationSchema.safeParse(req.body);
        if(!parseBody.success){
            return res.status(400).json({ errors: parseBody.error.errors });
        }


        //check if the user exists in the database
        const user = await prisma.user.findUnique({
            where: {
                email: parseBody.data.email,
            },
        });

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }


        //find the verification code in the database
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code: parseBody.data.code,
            },
        });

        if(!verificationCode){
            return res.status(400).json({ message: "Invalid verification code" });
        }

        //check if the verification code is expired
        if(verificationCode.expiresAt < new Date()){
            return res.status(400).json({ message: "Verification code expired" });
        }

        //update the user status to verified
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                verified: true,
                status: "ACTIVE",
            },
        });


        //update the verification code status to used
        await prisma.verificationCode.update({
            where: {
                id: verificationCode.id,
            },
            data: {
                status: "USED",
            },
        });

        //send success email
        axios.post(`${process.env.EMAIL_SERVICE_URL}/email/send`, {
            recipient: user.email,
            subject: "Email Verification",
            text: "Your email has been verified",
            source: "verify-email",
        });

        return res.status(200).json({ message: "Email verified successfully" });


    }catch(error){
        console.error("Error verifying email:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export default verifyEmail;