import express from 'express';
import dotenv, { config } from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { configRoutes } from './utils';


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());
app.use(morgan('dev'));
app.use(helmet());


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (_req, res)=>{
        res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
})

app.use("/api", limiter);

configRoutes(app);

interface ErrorWithStack extends Error {
    stack?: string;
}

app.use((_req, res)=>{
    res.status(404).json({ message: 'Not Found' });
})

app.use((err: ErrorWithStack, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});


app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'API Gateway UP' });
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`API Gateway is running on port ${port} :::: http://localhost:${port}`);
});


