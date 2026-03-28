// src/blocks/schema.ts
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { moduleHeader } from "./moduleHeader";
import { scriptField } from "./scriptField";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    moduleHeader: moduleHeader(),
    scriptField: scriptField(),
  },
});

export type RoteiroSchema = typeof schema;
