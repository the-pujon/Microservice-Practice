import { Express, Request, Response } from 'express';
import config from "./config.json"
import axios from 'axios';

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

export const configRoutes = (app:Express) => {

    Object.entries(config.services).forEach(([name, service])=>{
        // console.log(`/api/${name}`, service)
        const hostName = service.url;

        service.routes.forEach(route => {
            route.methods.forEach(method => {
                // console.log(`=> Configuring route for ${name}: ${method.toUpperCase()} /api${route.path} -> ${hostName}${route.path}`);
                const handler = createHandler( hostName, route.path, method.toLowerCase());

               
                // console.log(handler)
                // console.log(method)
                app[method.toLowerCase()](`/api${route.path}`, handler);

            })
        })
    })

}