// import { defaultSender, transporter } from "@/config";
// import prisma from "@/prisma";
// import EmailCreateSchema from "@/schemas"

// export const sendEmail = async (req, res) =>{
//     try{
//         console.log("Received request to send email:", req.body);
//         const parseBody = await EmailCreateSchema.safeParse(req.body);
//         console.log("Parsed body:", parseBody);
//         if(!parseBody.success){
//             console.error("Validation failed:", parseBody.error);
//             return res.status(400).json({errors: parseBody.error.errors});
//         }


//         const {body, recipient, sender, subject, source} = parseBody.data;
//         const from = sender || defaultSender;
//         const emailOption = {
//             from,
//             to: recipient,
//             subject,
//             text: body,
//         }


//         const {rejected} = await transporter.sendMail(emailOption)
//         console.log("Email sent with options:", emailOption);
//         console.log("Rejection details:", rejected);
//         if(rejected.length > 0) {
//             return res.status(500).json({message: "failed"})
//         }

//         await prisma.email.create({
//             data: {
//                 sender: from,
//                 recipient,
//                 subject,
//                 body,
//                 source: source || "unknown",
//             }
//         })

//         return res.status(200).json({message: "Email sent"})

//     }catch(error){

//     }
// }



import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
// import {  } from '@/schemas';
import { defaultSender, transporter } from '@/config';
import EmailCreateSchema from '@/schemas';
import { string } from 'zod';

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
	try {
        console.log("sadasds")
		// Validate the request body
		const parsedBody = EmailCreateSchema.safeParse(req.body);
		if (!parsedBody.success) {
			return res.status(400).json({ errors: parsedBody.error.errors });
		}

		// create mail option
		const { sender, recipient, subject, body, source } = parsedBody.data;
		const from = sender || defaultSender;
		const emailOption = {
			from,
			to: recipient,
			subject,
			text: body,
		};

		// send the email
		const { rejected } = await transporter.sendMail(emailOption);
		if (rejected.length) {
			console.log('Email rejected: ', rejected);
			return res.status(500).json({ message: 'Failed' });
		}

		await prisma.email.create({
			data: {
				sender: from,
				recipient,
				subject,
				body,
				source : source || 'unknown',
			},
		});

		return res.status(200).json({ message: 'Email sent' });
	} catch (error) {
		next(error);
	}
};

export default sendEmail;
