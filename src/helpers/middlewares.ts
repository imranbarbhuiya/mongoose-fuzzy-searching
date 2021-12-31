import { Attributes, Fields } from "../types";
import { createNGrams } from "./db/fields";

export const createNGramsMiddleware = (
  attributes: Attributes,
  fields: Fields,
  next: { (err?: any): any }
): void => {
  try {
    if (!Array.isArray(attributes)) {
      attributes = [attributes];
    }

    attributes.forEach((attribute: Attributes) => {
      createNGrams(attribute, fields);
    });
    next();
  } catch (err) {
    next(err);
  }
};
