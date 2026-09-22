import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorHandler } from "./http/middleware/errorHandler.middleware";
import { userRouter } from "./http/features/users/user.route";
import { speciesRouter } from "./http/features/species/species.route";
import { articleRouter } from "./http/features/article/article.route";
import { taxonomyRouter } from "./http/features/taxonomy/taxonomy.route";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/", userRouter);
app.use("/api/v1/", speciesRouter);
app.use("/api/v1/", articleRouter);
app.use("/api/v1/", taxonomyRouter);
// error handler global vai no final, depois de todas as rotas
app.use(errorHandler);

export default app;
