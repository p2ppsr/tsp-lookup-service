const makeMigrations = require('./makeMigrations')

/**
 * StorageEngine specifically implemented for TSP Lookup with Knex
 * TODO: Use Typescript interface to extend functionality of base class
 * Generic lookservice should return the topic as well as the txid and vout
 */
class KnexStorageEngine {
  constructor({ knex, tablePrefix = 'TSP_lookup_' }) {
    this.knex = knex
    this.tablePrefix = tablePrefix
    this.migrations = makeMigrations({ tablePrefix })
  }

  /**
   * Stores a new TSP record
   * @param {object} obj all params given in an object
   * @param {string} obj.txid the transactionId of the transaction this UTXO is apart of
   * @param {Number} obj.vout index of the output
   * @param {String} obj.artistIdentityKey artist's identity key(s)
     @param {String} obj.songTitle title of song
     @param {String} obj.artistName artist's name(s)
     @param {String} obj.description song description
     @param {String} obj.duration duration of song
     @param {String} obj.songFileURL NanoStore UHRP URL for song file
     @param {String} obj.artFileURL  NanoStore UHRP URL for artwork
   */
  async storeRecord({
    txid,
    vout,
    artistIdentityKey,
    songTitle,
    artistName,
    description,
    duration,
    songFileURL,
    artFileURL }) {
    await this.knex(`${this.tablePrefix}songs`).insert({
      txid,
      vout,
      artistIdentityKey,
      songTitle,
      artistName,
      description,
      duration,
      songFileURL,
      artFileURL
    })
  }

  /**
   * Deletes an existing TSP record
   * @param {Object} obj all params given in an object
   */
  async deleteRecord({ txid, vout }) {
    await this.knex(`${this.tablePrefix}songs`).where({
      txid,
      vout
    }).del()
  }

  /**
   * Look up a TSP record by the artistIdentityKey
   * @param {Object} obj params given in an object
   * @param {String} obj.artistIdentityKey artist's identity key(s)
   */
  async findByArtistIdentityKey({ artistIdentityKey }) {
    return await this.knex(`${this.tablePrefix}songs`).where({
      artistIdentityKey
    }).select('txid', 'vout')
  }

  /**
   * Look up a TSP record by the songTitle
   * @param {Object} obj params given in an object
   * @param {String} obj.songTitle title of song
   */
  async findBySongTitle({ songTitle }) {
    return await this.knex(`${this.tablePrefix}songs`).where({
      songTitle
    }).select('txid', 'vout')
  }

  /**
   * Look up a TSP record by the artistName
   * @param {Object} obj params given in an object
   * @param {String} obj.artistName artist's name(s)
   */
  async findByArtistName({ artistName }) {
    return await this.knex(`${this.tablePrefix}songs`).where({
      artistName
    }).select('txid', 'vout')
  }

  /**
   * Look up song by song UHRP url
   * @param {Object} obj params given in an object
   * @param {String} obj.songIDs array of songs to return by uhrp song url
   */
  async findBySongIDs({ songIDs }) {
    return await this.knex(`${this.tablePrefix}songs`)
      .whereIn('songFileURL', songIDs)
      .select('txid', 'vout');
  }

  /**
   * Get all songs
   * @param {Object} obj params given in an object
   * @param {String} obj.artistIdentityKey artist's identity key(s)
   */
  async findAll() {
    return await this.knex(`${this.tablePrefix}songs`).select('txid', 'vout')
  }
}
module.exports = KnexStorageEngine