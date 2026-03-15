import type { Request, Response, NextFunction } from "express";
import memberSchema from "./member.schema.js";
import z from "zod";
import memberService from "./member.service.js";
import sendResponse from "../../utils/sendResponse.js";

type GetAllMembersRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof memberSchema.getAllMembersSchema>["query"]
>;
type GetMemberByIdRequest = Request<
  z.infer<typeof memberSchema.getMemberByIdSchema>["params"]
>;

type CreateMemberRequest = Request<
  unknown,
  unknown,
  z.infer<typeof memberSchema.createMemberSchema>["body"]
>;

type UpdateMemberRequest = Request<
  z.infer<typeof memberSchema.updateMemberSchema>["params"],
  unknown,
  z.infer<typeof memberSchema.updateMemberSchema>["body"]
>;

type DeleteMemberRequest = Request<
  z.infer<typeof memberSchema.deleteMemberSchema>["params"]
>;

const memberController = {
  getAllMembers: async (
    req: GetAllMembersRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { query } = req;
      const result = await memberService.getAllMembers({ query });
      sendResponse(
        res,
        200,
        "Members fteched successfully",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },

  getMemberById: async (
    req: GetMemberByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await memberService.getMemberById({
        id: req.params.id,
      });
      sendResponse(
        res,
        200,
        `Member with ID ${req.params.id} fetched successfully`,
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  createMember: async (
    req: CreateMemberRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await memberService.createMember({
        data: req.body,
      });
      sendResponse(
        res,
        201,
        `Member with ID ${result.id} created successfully`,
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  updateMember: async (
    req: UpdateMemberRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await memberService.updateMember({
        id: req.params.id,
        data: req.body,
      });
      sendResponse(
        res,
        200,
        `Member with ID ${req.params.id} updated successfully`,
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  deleteMember: async (
    req: DeleteMemberRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await memberService.deleteMember({
        id: req.params.id,
      });
      sendResponse(
        res,
        200,
        `Member with ID ${req.params.id} deleted successfully`,
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};

export default memberController;
