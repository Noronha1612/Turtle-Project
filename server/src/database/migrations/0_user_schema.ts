import knex from 'knex';

export function up(knex: knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').notNullable();
        table.string('name').notNullable();
        table.string('nickname').notNullable();
        table.string('whatsapp').notNullable().unique();
        table.string('city').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.date('birthday').notNullable();
        table.integer('avatar_id').notNullable();
    });
}

export function down(knex: knex) {
    return knex.schema.dropTable('users');
}