import { jwt } from 'jsonwebtoken';
import { AccessTokenSchema } from "@/schemas";
import prisma from '@/prisma';

const verifyToken = async (req, res) => {
    try {
        const parseBody = await AccessTokenSchema.safeParse(req.body);

        if(!parseBody.success) {
            return res.status(400).json({ errors: parseBody.error.errors });
        }

        const { accessToken } = parseBody.data;

        const decode = await jwt.verify(accessToken, process.env.JWT_SECRET);

        const user = prisma.user.findUnique({
            where: {
                id: (decode as any).id
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })

        if(!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json({ message: "Authorized", user });

    }
    catch(error) {
        console.error("Error verifying token:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}


export default verifyToken;