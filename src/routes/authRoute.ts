import { Router } from "express";
import { userController } from "../controllers/userController";

const router = Router();

router.get("/", userController.getAll);
router.get("/:id", userController.getById);

router.put("/:id", userController.edit);

router.delete("/:id", userController.deleteById);

export default router;