import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();

// security middlewares
app.use(helmet());
app.use(cors());

// body parser
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// logging
app.use(morgan("dev"));

// routes
app.use("/", routes);

// global error handler
app.use(errorHandler);

export default app;