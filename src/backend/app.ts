import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./http/middleware/errorHandler.middleware";
import { userRouter } from "./http/features/users/user.route";
import { speciesRouter } from "./http/features/species/species.route";
import { articleRouter } from "./http/features/article/article.route";
import { taxonomyRouter } from "./http/features/taxonomy/taxonomy.route";
import { specimenRouter } from "./http/features/specimen/specimen.route";
import { attributeTemplatesRouter } from "./http/features/attribute_templates/attribute_templates.route";
import { sourcesRouter } from "./http/features/sources/sources.route";
import { imagesRouter } from "./http/features/images/images.route";
import { galleryRouter } from "./http/features/gallery/gallery.route";
import { favoriteRouter } from "./http/features/favorite/favorite.route";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/", userRouter);
app.use("/api/v1/", speciesRouter);
app.use("/api/v1/", articleRouter);
app.use("/api/v1/", taxonomyRouter);
app.use("/api/v1/", specimenRouter);
app.use("/api/v1/", attributeTemplatesRouter);
app.use("/api/v1/", sourcesRouter);
app.use("/api/v1/", imagesRouter);
app.use("/api/v1/", galleryRouter);
app.use("/api/v1/", favoriteRouter);
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(__dirname, "../../dist");
  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// error handler global vai no final, depois de todas as rotas
app.use(errorHandler);

export default app;
