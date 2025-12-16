import { Request, response, Response } from "express"
import { ResponseData } from "../utils/Response"
import { userService } from "../services/userService";

export const userController = {

    async getAll(req: Request, res: Response) {
        try {
            const user = await userService.getUsers();
            return ResponseData.ok(res, user);
        } catch (error) {
            return ResponseData.serverError(res, error)
        }
    },

    async getById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

            const user = await userService.getById(id);

            return ResponseData.ok(res, user);
    
        } catch (error) {
            return ResponseData.serverError(res, error)        
        }
    },

    async edit(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

            const user = await userService.editUser(id, req.body);

            return ResponseData.ok(res, user)
        } catch (error) {
            return ResponseData.serverError(res, error)
        }
    },

    async deleteById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

            const user = await userService.deleteUser(id);

            return ResponseData.ok(res, user)
        } catch (error) {
            return ResponseData.serverError(res, error)
        }
    }
}