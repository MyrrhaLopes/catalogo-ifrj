import { Router } from "express";

export const userRouter = Router();
import { userRegisterSchema } from "./user.schema";
import { USER_SERVICE } from "./user.service";
import { authorizeUser } from "../../middleware/authorizeUser";

//registrar usário
userRouter.post("/users/", async (req, res, next) => {
  try {
    const { email, password } = userRegisterSchema.parse(req.body);
    const user = await USER_SERVICE.registerUser(email, password);

    return res.status(201).json({ user });
  } catch (err) {
    if (!(err instanceof Error)) {
      //TODO: buscar implicação de retornar erros não tipados dessa forma
      return res.status(500);
    }
    if (err.message.includes("email")) {
      return res.status(409).json({ message: "Email já cadastrado" });
    }
    next(err);
  }
});

//logar o usuário (criar sessão)
userRouter.post("/sessions/", async (req, res, next) => {
  try {
    const { email, password } = userRegisterSchema.parse(req.body);
    const sessionId = await USER_SERVICE.loginUser(email, password);
    return res
      .cookie("session_id", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
      })
      .status(201)
      .send();
  } catch (err) {
    console.log(err);
    if (!(err instanceof Error)) return next(err);
    if (
      err.message === "user not found" ||
      err.message === "Credenciais inválidas"
    ) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    next(err);
  }
});

userRouter.get("/sessions/", authorizeUser, (req, res) => {
  return res.status(200).json(req.user);
});

userRouter.delete("/sessions/", authorizeUser, async (req, res, next) => {
  try {
    const sessionId = req.cookies["session_id"];
    await USER_SERVICE.logoutUser(sessionId);
    return res.clearCookie("session_id").status(204).send();
  } catch (err) {
    next(err);
  }
});

userRouter.delete("/users/", authorizeUser, async (req, res, next) => {
  try {
    await USER_SERVICE.deleteUser(req.user!.id);
    return res.clearCookie("session_id").status(204).send();
  } catch (err) {
    next(err);
  }
});

userRouter.get("/users/", authorizeUser, async (_req, res, next) => {
  try {
    const users = await USER_SERVICE.getUsers();
    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
});
