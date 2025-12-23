import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { productController } from "../controllers/productController";


const router = Router();


router.get("/", authMiddleware, productController.getAll);
router.get("/:id", authMiddleware, productController.getById);
router.post("/", authMiddleware, productController.create);
router.patch("/:id", authMiddleware, productController.edit);
router.delete("/:id", authMiddleware, productController.deleteById);


export default router;