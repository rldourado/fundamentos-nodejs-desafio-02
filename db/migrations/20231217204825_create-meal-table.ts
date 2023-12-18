import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('description').notNullable()
    table.timestamp('meal_time').defaultTo(knex.fn.now()).notNullable()
    table.boolean('in_diet').defaultTo(false)
    table.uuid('session_id').index()

    table.uuid('user_id').references('id').inTable('users')

    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
