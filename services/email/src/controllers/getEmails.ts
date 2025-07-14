import prisma from "@/prisma";

export const getEmails = async (req, res) => {
    try {
        const emails = await prisma.email.findMany({
            orderBy: {
                sentAt: 'desc',
            },
        });

        return res.status(200).json(emails);
    } catch (error) {
        console.error("Error fetching emails:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}