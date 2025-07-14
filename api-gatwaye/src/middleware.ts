import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
const auth = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.headers['authorization']){
        return res.status(401).json({message: 'Unauthorized'});
    }
    
    try{
        const token = req.headers['authorization'].split(' ')[1];
        const {data} = await axios.post(`${process.env.AUTH_SERVICE_URL}/auth/verify-token`, {accessToken: token,
            headers: {
                ip: req.ip,
                'user-agent': req.headers['user-agent'],
            }
        });

        req.headers['x-user-id'] = data.userId;
        req.headers['x-user-name'] = data.name;
        req.headers['x-user-email'] = data.email;
        req.headers['x-user-role'] = data.role;
        next();
    }catch(error){
        console.error('Error in auth middleware:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
}

const middlewares = {auth}
export default middlewares;