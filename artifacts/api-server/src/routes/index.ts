import { Router, type IRouter } from "express";
import healthRouter from "./health";
import naseemRouter from "./naseem";

const router: IRouter = Router();

router.use(healthRouter);
router.use(naseemRouter);

export default router;
