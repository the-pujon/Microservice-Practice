import { redis } from '@/redis';
import { CartItemSchema } from '@/schema';
import { NextFunction, Request, Response } from 'express';

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try{
        //validate request body
        const parseBody = CartItemSchema.safeParse(req.body);
        if(!parseBody.success) {
            return res.status(400).json({
                errors: parseBody.error.errors
            });
        }

        let cartSessionId = (req.headers['x-cart-session-id']as string)  || null;

        if(cartSessionId){
            const exists = await redis.exists(cartSessionId);
            console.log('Cart session exists:', exists);

            if(!exists){
                cartSessionId = null;
            }
        }

        if(!cartSessionId){
            cartSessionId = 
        }
    }
    catch (error) {
        next(error);
    }
}

export default addToCart;
