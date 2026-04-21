import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import storageRouter from "./storage";
import serverStatusRouter from "./server-status";
import productsRouter from "./products";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(storageRouter);
router.use(serverStatusRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(adminRouter);

export default router;
