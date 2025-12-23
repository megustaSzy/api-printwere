import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";


const router = Router();

router.get("/profile", authMiddleware, userController.getProfile);
router.get("/", authMiddleware, authorizeRoles("Admin"), userController.getAll);
router.get("/:id", authMiddleware, userController.getById);
router.patch("/:id", authMiddleware, userController.edit);
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), userController.deleteById);

export default router;