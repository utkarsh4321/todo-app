// routes import
import { router as userRouter } from "./features/users/routes";
import { router as todoRouter } from "./features/todos/routes";
import { app } from "./app";
import { requestValidator } from "./middleware/requestValidator";
const baseApiPath = process.env.BASE_API_PATH;

// All route middleware

app.use(`${baseApiPath}/user`, userRouter);
app.use(`${baseApiPath}/todo`, requestValidator, todoRouter);
