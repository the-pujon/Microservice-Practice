import { INVENTORY_SERVICE } from "@/config";
import { redis } from "@/redis";
import axios from "axios";

export const clearCart = (id: string) => {
    try{
        const data = redis.hgetall(`cart:${id}`);
        if(Object.keys(data).length > 0){
            // redis.del(`cart:${id}`);
            return
        }

        const items = Object.keys(data).map((key) => {
            const { inventoryId, quantity } = JSON.parse(data[key]) as {
              inventoryId: string;
              quantity: number; 
            };
            return {
              productId: key,
              inventoryId,
              quantity,
            };
        });

        const request = items.map(item=>{
            return axios.put(`${INVENTORY_SERVICE}/api/inventories/${item.inventoryId}`,{
                quantity: item.quantity,
                actionType: "IN"
            })
        })

        Promise.all(request).then(responses=>{
            redis.del(`cart:${id}`);
            console.log("Cart cleared and inventory updated for session:", id);
        }).catch(err=>{
            console.log("error from clear cart causes by inventory update", err);
        })


    }catch(error){
        console.log("error from clear cart causes by redis pub sub", error);
    }
}