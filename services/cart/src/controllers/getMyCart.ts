import { redis } from "@/redis";
import { NextFunction, Request, Response } from "express";
const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (!cartSessionId) {
      return res.status(200).json({ data: [] });
    }

    //check if session exists
    const session = await redis.exists(`session:${cartSessionId}`);

    if (!session) {
      await redis.del(`cart:${cartSessionId}`);
      return res.status(200).json({ data: [] });
    }

    const items = await redis.hgetall(`cart:${cartSessionId}`);

    //if Items not found
    if (Object.keys(items).length === 0) {
      return res.status(200).json({ data: [] });
    }

    // formate items
    const formattedItems = Object.keys(items).map((key) => {
      const { inventoryId, quantity } = JSON.parse(items[key]) as {
        inventoryId: string;
        quantity: number;
      };
      return {
        productId: key,
        inventoryId,
        quantity,
      };
    });

    return res.status(200).json({ items: formattedItems });
  } catch (error) {
    next(error);
  }
};

export default getMyCart;
