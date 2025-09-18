import { CART_TTL } from "@/config";
import { redis } from "@/redis";
import { CartItemSchema } from "@/schema";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //validate request body
    const parseBody = CartItemSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({
        errors: parseBody.error.errors,
      });
    }

    let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (cartSessionId) {
      const exists = await redis.exists(`session:${cartSessionId}`);
      console.log("Cart session exists:", exists);

      if (!exists) {
        cartSessionId = null;
      }
    }

    if (!cartSessionId) {
      // Generate a new session ID if not present
      cartSessionId = uuid();
      console.log("Generated new cart session ID:", cartSessionId);

      // Initialize a new cart in Redis
      await redis.setex(`session:${cartSessionId}`, CART_TTL, cartSessionId); // 7 days expiry

      res.setHeader("x-cart-session-id", cartSessionId);
    }

    //check if the inventory available
    const { data } = await axios.get(
      `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${parseBody.data.inventoryId}`
    );
    if (Number(data.quantity) < parseBody.data.quantity) {
      return res.status(400).json({
        error: "Insufficient inventory",
      });
    }

    await redis.hset(
      `cart:${cartSessionId}`,
      parseBody.data.productId,
      JSON.stringify({
        inventoryId: parseBody.data.inventoryId,
        quantity: parseBody.data.quantity,
      })
    );

    //update Inventory
    await axios.put(
      `${process.env.INVENTORY_SERVICE_URL}/api/inventories/${parseBody.data.inventoryId}`,
      {
        // inventoryId: parseBody.data.inventoryId,
        quantity: parseBody.data.quantity,
        actionType: "OUT",
      }
    );

    return res.status(200).json({
      message: "Item added to cart",
      cartSessionId,
      item: parseBody.data,
    });
  } catch (error) {
    next(error);
  }
};

export default addToCart;
