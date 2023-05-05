const makeMigrations = ({ tablePrefix }) => ([{
    up: async knex => {
      await knex.schema.createTable(`${tablePrefix}songs`, table => {
        table.increments('songID', options={primaryKey: true})
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
      await knex.schema.dropTable(`${tablePrefix}songs`)
    }
  }])
  module.exports = makeMigrations
