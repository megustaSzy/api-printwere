import { Router } from "express";
import { orderItemController } from "../controllers/orderItemController";

const router = Router();

router.post("/", orderItemController.create);
router.patch("/:id", orderItemController.updateQuantity);
router.delete("/:id", orderItemController.remove);

export default router;
