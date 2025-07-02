import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { createProduct, getProductDetails, getProducts, updateProduct } from './controllers';
// import {
// 	createProduct,
// 	getProductDetails,
// 	getProducts,
// 	updateProduct,
// } from './controllers';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'UP' });
});


app.use((req, res, next) => {
	const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
	const origin = req.headers.origin || '';

	if (allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		next();
	} else {
		res.status(403).json({ message: 'Forbidden' });
		// Call next() to ensure the middleware always completes as expected by Express types
		next();
	}
});

// app.use((req, res, next) => {
// 	const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
// 	const origin = req.headers.origin || '';

// 	if (allowedOrigins.includes(origin)) {
// 		res.setHeader('Access-Control-Allow-Origin', origin);
// 		next();
// 	} else {
// 		res.status(403).json({ message: 'Forbidden' });
// 	}
// });
function asyncHandler(fn: any) {
	return (req: express.Request, res: express.Response, next: express.NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

// routes
app.get('/products/:id', asyncHandler(getProductDetails));
app.put('/products/:id', asyncHandler(updateProduct));
app.get('/products', asyncHandler(getProducts));
app.post('/products', asyncHandler(createProduct));

// 404 handler
app.use((_req, res) => {
	res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 4001;
const serviceName = process.env.SERVICE_NAME || 'Product-Service';

app.listen(port, () => {
	console.log(`${serviceName} is running on port ${port}`);
});
