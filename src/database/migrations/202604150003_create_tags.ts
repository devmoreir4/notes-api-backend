import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tags", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table
      .integer("note_id")
      .notNullable()
      .references("id")
      .inTable("notes")
      .onDelete("CASCADE")
      .index();
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .index();
    table.timestamps(true, true);
    table.unique(["note_id", "name"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tags");
}
