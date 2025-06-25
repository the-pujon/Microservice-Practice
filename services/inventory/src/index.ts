import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.get('/health', (_req, res) => {
    res.status(200).json({status: 'UP'});
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({error: 'Not found'});
});

// error handler
app.use((err, _req, res, _next) => {
    console.log("error stack:", err.stack); 
    res.status(500).json({ message: 'Internal server', error: err.message});
});

const port = process.env.PORT || 4002;
const serviceName = process.env.SERVICE_NAME || 'inventory-service';

app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
});