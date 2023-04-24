const makeMigrations = ({ tablePrefix }) => ([{
    up: async knex => {
      await knex.schema.createTable(`${tablePrefix}users`, table => {
        table.increments()
        table.string('txid')
        table.integer('vout')
        table.string('artistIdentityKey')
        table.string('songTitle')
        table.string('artistName')
        table.string('description')
        table.string('duration')
        table.string('songFileURL')
        table.string('artFileURL')
      })
    },
    down: async knex => {
      await knex.schema.dropTable(`${tablePrefix}users`)
    }
  }])
  module.exports = makeMigrations

//Note: Are sats and songID columns required?
