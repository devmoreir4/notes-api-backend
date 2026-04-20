import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("links", (table) => {
    table.increments("id").primary();
    table.text("url").notNullable();
    table
      .integer("note_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("notes")
      .onDelete("CASCADE")
      .index();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("links");
}
