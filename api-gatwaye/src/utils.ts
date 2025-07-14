import { Express, Request, Response } from 'express';
import config from "./config.json"
import axios from 'axios';
import middlewares from './middleware';

const createHandler = (hostName: string, path: string, method: string) => {
    // console.log("method", method, "hostName", hostName, "path", path)
    return async (req: Request, res: Response) => {
        // console.log("Method come here")
         console.log("url", `${hostName}${path}`)
        try {
            const {data} = await axios({
                method,
                url: `${hostName}${path}`,
                data: req.body,
                headers : {
                    origin: "http://localhost:8086",
                    'x-user-id': req.headers['x-user-id'],
                    'x-user-name': req.headers['x-user-name'],
                    'x-user-email': req.headers['x-user-email'],
                    'x-user-role': req.headers['x-user-role'],
                    'user-agent': req.headers['user-agent'],
                }
            })

            console.log(data)

            res.status(200).json(data);
        }catch (error) {
            if(error instanceof axios.AxiosError){
                return res.status(error.response?.status || 500).json({
                    message: error.response?.data,
                });
            }

            console.log(`Error in route handler for ${method.toUpperCase()} ${path}:`, error);
            res.status(500).json({ message: 'Internal server error' });
        }

    }
}

export const getMiddleware = (names:string[]) => {
    return names.map(name=> middlewares[name])
}

export const configRoutes = (app:Express) => {

    Object.entries(config.services).forEach(([name, service])=>{
        // console.log(`/api/${name}`, service)
        const hostName = service.url;

        service.routes.forEach(route => {
            route.methods.forEach(method => {
                const endpoint = `/api${route.path}`
                const handler = createHandler( hostName, route.path, method.toLowerCase());
                const middlewares = getMiddleware(route.middlewares || []);
                app[method.toLowerCase()](endpoint , ...middlewares, handler);

            })
        })
    })

}