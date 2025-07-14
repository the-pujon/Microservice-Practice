import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
// import { sendEmail } from "./controllers/sendEmail";
import { getEmails } from "./controllers/getEmails";
import sendEmail from "./controllers/sendEmail";
// import { userLogin, userRegistration, verifyToken } from "./controllers";
// import { createUser, getUserById } from './controllers';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});

// app.use((req, res, next) => {
//   const allowedOrigins = ["http://localhost:8081", "http://127.0.0.1:8081"];
//   const origin = req.headers.origin || "";

//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//     next();
//   } else {
//     res.status(403).json({ message: "Forbidden" });
//     // Call next() to ensure the middleware always completes as expected by Express types
//     next();
//   }
// });

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
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// app.get('/users/:id', asyncHandler(getUserById));
// app.post('/users', asyncHandler(createUser));
// app.post("/auth/register", asyncHandler(userRegistration));
// app.post("/auth/login", asyncHandler(userLogin));
// app.post("/auth/verify-token", asyncHandler(verifyToken));
app.post("/emails/send", asyncHandler(sendEmail))
app.get("/email", asyncHandler(getEmails))

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 4005;
const serviceName = process.env.SERVICE_NAME || "Email-Service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}:: http://localhost:${port}`);
});
