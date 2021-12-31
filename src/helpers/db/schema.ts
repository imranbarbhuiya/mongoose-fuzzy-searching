import { SchemaOptions } from "mongoose";
import { Fields } from "../../types";
import { isFunction } from "../utils";
import { removeFuzzyElements } from "./fields";

const transformer = (fields: Fields) => (docToObj?: any) => ({
  ...(docToObj || {}),
  transform: (doc: any, ret: any, options: any) => {
    // Execute first the default transformer function (toObject or toJSON) if is set
    // and then run the custom transformer that removes the fuzzy elements
    if (docToObj && docToObj.transform && isFunction(docToObj.transform)) {
      docToObj.transform(doc, ret, options);
    }

    return removeFuzzyElements(fields)(doc, ret);
  },
});

export const setTransformers = (
  fields: Fields,
  options?: SchemaOptions
): {
  toObject: any;
  toJSON: any;
} => {
  const transform = transformer(fields);

  return {
    toJSON: transform(options?.toJSON),
    toObject: transform(options?.toObject),
  };
};
