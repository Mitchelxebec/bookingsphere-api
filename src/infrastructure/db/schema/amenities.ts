import { index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const amenities = pgTable(
  "amenities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
  },
  (table) => ({
    searchIdx: index("idx_property_amenities").on(table.name),
  }),
);
