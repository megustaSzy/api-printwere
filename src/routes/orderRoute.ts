import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, orderController.create);
router.get("/", authMiddleware, orderController.getAll);
router.get("/:id", authMiddleware, orderController.getById);
router.patch("/:id/status", authMiddleware, orderController.updateStatus);
router.delete("/:id", orderController.remove);


export default router;

