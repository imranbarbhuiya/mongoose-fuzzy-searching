import { IndexDefinition, Schema, UpdateQuery } from "mongoose";
import {
  createFields,
  createNGramsMiddleware,
  setTransformers,
  StaticFuzzySearch,
} from "./helpers";
import { Attributes, PluginSchemaOptions } from "./types";

export { confidenceScore, sort } from "./helpers/db/search";
export * from "./types";
export { MongoosePluginModel } from "./types";

const plugin = function (
  schema: Schema,
  { fields, options }: PluginSchemaOptions
): void {
  const { indexes, weights } = createFields(schema, fields);
  const { toJSON, toObject } = setTransformers(fields, options);

  schema.index(indexes as IndexDefinition, { weights, name: "fuzzy_text" });
  schema.set("toObject", toObject);
  schema.set("toJSON", toJSON);

  schema.pre("save", function (next) {
    return createNGramsMiddleware(this, fields, next);
  });

  schema.pre("findOneAndUpdate", function (next) {
    return createNGramsMiddleware(
      this.getUpdate() as UpdateQuery<any>,
      fields,
      next
    );
  });

  schema.pre("updateMany", function (next) {
    return createNGramsMiddleware(
      this.getUpdate() as UpdateQuery<any>,
      fields,
      next
    );
  });

  schema.pre("updateOne", function (next) {
    return createNGramsMiddleware(this.getUpdate(), fields, next);
  });

  schema.pre(
    "insertMany",
    function (next: (err?: any) => any, docs: Attributes) {
      createNGramsMiddleware(docs, fields, next);
    }
  );

  schema.statics.fuzzySearch = function (...args: any[]) {
    return new StaticFuzzySearch(...args).search(this);
  };
};

export default plugin;
