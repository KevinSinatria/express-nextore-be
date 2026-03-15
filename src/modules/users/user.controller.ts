import type { Request, Response, NextFunction } from "express";
import userSchema from "./user.schema.js";
import z from "zod";
import userService from "./user.service.js";
import sendResponse from "../../utils/sendResponse.js";

type GetAllUsersRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof userSchema.getAllUsersSchema>["query"]
>;
type GetUserByIdRequest = Request<
  z.infer<typeof userSchema.getUserByIdSchema>["params"]
>;
type GetUserByUsernameRequest = Request<
  z.infer<typeof userSchema.getUserByUsernameSchema>["params"]
>;
type CreateUserRequest = Request<
  unknown,
  unknown,
  z.infer<typeof userSchema.createUserSchema>["body"]
>;
type UpdateUserRequest = Request<
  z.infer<typeof userSchema.updateUserSchema>["params"],
  unknown,
  z.infer<typeof userSchema.updateUserSchema>["body"]
>;
type DeleteUserRequest = Request<
  z.infer<typeof userSchema.deleteUserSchema>["params"]
>;

const userController = {
  getAllUsers: async (
    req: GetAllUsersRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await userService.getAllUsers({ query: req.query });
      sendResponse(
        res,
        200,
        "Users fetched successfully",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (
    req: GetUserByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await userService.getUserById({
        id: req.params.id,
      });
      sendResponse(res, 200, "User fetched successfuly", result);
    } catch (error) {
      next(error);
    }
  },

  getUserByUsername: async (
    req: GetUserByUsernameRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await userService.getUserByUsername({
        username: req.params.username,
      });
      sendResponse(res, 200, "User fetched successfuly", result);
    } catch (error) {
      next(error);
    }
  },

  createUser: async (
    req: CreateUserRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await userService.createUser({ data: req.body });
      sendResponse(res, 200, "User fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (
    req: UpdateUserRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await userService.updateUser({
        id: req.params.id,
        data: req.body,
      });
      sendResponse(res, 200, "User updated successfully", result);
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (
    req: DeleteUserRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await userService.deleteUser({ id: req.params.id });
      sendResponse(res, 200, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
