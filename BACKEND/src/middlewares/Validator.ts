import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { Model } from "mongoose";
import { RoleEnum } from "../types";
import { getModelByRole, removeFile } from "../constants/lib";

export const validate = (validationChain: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(
        validationChain.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);

      if (errors.isEmpty()) {
        next();
        return;
      }

      await removeFile(req.file);

      const msg = errors
        .array()
        .map((err) => err.msg)
        .join("\n");

      return res.status(400).json({ msg });
    } catch (error: any) {
      await removeFile(req.file);

      res.status(500).json({ msg: error.message });
    }
  };
};

export const dbDelete = (model: typeof Model) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await model.findById(id);
      if (result) {
        req.prevObject = result;
        await result.deleteOne();
        next();
        return;
      }
      return res
        .status(404)
        .json({ msg: `${model.modelName} with id : ${id} not found` });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  };
};

export const dbUserDelete = (isQuery = false) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      let role = null;
      
      if (isQuery) {
        role = req.query.role;
      } else {
        role = req.body.role;
      }

      const modelToUse = getModelByRole(role);

      if (!modelToUse) {
        return res.status(400).json({ msg: "Invalid role" });
      }

      const result = await modelToUse.findById(id);

      if (result) {
        req.prevObject = result;
        await result.deleteOne();
        next();
        return;
      }

      return res.status(404).json({ msg: `${role} with id : ${id} not found` });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  };
};

export const dbCheck = (model: typeof Model) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await model.findById(id);

      if (result) {
        req.prevObject = result;
        next();
        return;
      }

      await removeFile(req.file);

      return res
        .status(404)
        .json({ msg: `${model.modelName} with id : ${id} not found` });
    } catch (error: any) {
      await removeFile(req.file);
      res.status(500).json({ msg: error.message });
    }
  };
};

export const dbCheckBody = (
  model: typeof Model,
  keyToCheck: string | Array<string>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = null;

      const key = req.body[keyToCheck as keyof typeof req.body] as string;

      if (Array.isArray(keyToCheck)) {
        const keysToCheck = keyToCheck.map((key) => {
          return { [key]: req.body[key] };
        });

        result = await model.findOne({ $or: keysToCheck });
      } else {
        result = await model.findOne({ [keyToCheck]: key });
      }

      if (!result) {
        next();
        return;
      }
      if (Array.isArray(keyToCheck)) {
        return res.status(404).json({
          msg: `${model.modelName} same ${keyToCheck.join(
            ", "
          )} already exists`,
        });
      }
      return res.status(404).json({
        msg: `${model.modelName} with ${keyToCheck} : ${key} already exists`,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  };
};

export const dbCheckBodyUpdate = (model: typeof Model, keyToCheck: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // this is for update
      const { id } = req.params;

      const key = req.body[keyToCheck as keyof typeof req.body];

      const result = await model.findOne({ [keyToCheck]: key });

      // we are checking if the result is the same as the id
      // if same we are allowing the update
      // else we are sending the error
      if (!result || result._id == id) {
        next();
        return;
      }

      return res.status(404).json({
        msg: `${model.modelName} with ${keyToCheck} : ${key} already exists`,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  };
};

export const dbUserCheck = (role: RoleEnum) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const modelToUse = getModelByRole(role);

      if (!modelToUse) {
        return res.status(400).json({ msg: "Invalid role" });
      }

      const result = await modelToUse.findById(id);

      if (result) {
        next();
        return;
      }

      return res.status(404).json({ msg: `${role} with id : ${id} not found` });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  };
};

export const dbUserCheckV2 = (flip = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role, email } = req.body;

      const modelToUse = getModelByRole(role);

      if (!modelToUse) {
        return res.status(400).json({ msg: "Invalid role" });
      }

      let result;

      if (flip) {
        result = await modelToUse.findOne({ email });
      } else {
        result = await modelToUse.findById(id);
      }

      if (flip) {
        if (!result) {
          next();
          return;
        }
        return res
          .status(400)
          .json({ msg: `${role} with email : ${email} already exists` });
      }

      if (result) {
        next();
        return;
      }

      return res.status(404).json({ msg: `${role} with id : ${id} not found` });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  };
};


