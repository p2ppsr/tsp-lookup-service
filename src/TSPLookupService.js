// import { IStorageEngine } from "../confederacy/src/Interfaces/IStorageEngine"
const pushdrop = require('pushdrop')
const KnexStorageEngine = require('./KnexStorageEngine')

/**
 * Note: initial implementation uses basic Javascript class implementation and not abstract classes.
 * TODO: Create an interface using Typescript that describes the requirements of a LookupService,
 * then implement it specifically for TSP
 * StorageEngine should also use an interface and specifically implement it for TSP
 */

/**Tempo Song Protocol fields
0=<pubkey>
1=OP_CHECKSIG
2=Protocol Namespace Address (`1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36`)
3=Song Title
4=Artist(s)
5=Description
6=Duration
7=Song NanoStore UHRP URL
8=Album Artwork NanoStore UHRP URL
9=A signature from the field 0 public key over fields 2-8
Above 9=OP_DROP / OP_2DROP — Drop fields 2-8 from the stack.**/


class TSPLookupService {
  constructor ({ storageEngine }) {
    this.storageEngine = storageEngine
  }

  /**
   * Notifies the lookup service of a new output added.
   * @param {Object} obj all params are given in an object
   * @param {string} obj.txid the transactionId of the transaction this UTXO is apart of
   * @param {Number} obj.vout index of the output
   * @param {Buffer} obj.outputScript the outputScript data for the given UTXO
   * @returns {string} indicating the success status
   */
  async outputAdded ({ txid, vout, outputScript, topic }) {
    if (topic !== 'TSP') return
    // Decode the TSP fields from the Bitcoin outputScript
    const result = pushdrop.decode({
      script: outputScript.toHex(), // Is Buffer form supported by PushDrop?
      fieldFormat: 'buffer'
    })

    // TSP song data to store
    const artistIdentityKey = result.lockingPublicKey
    const songTitle = result.fields[2].toString('base64')
    const artistName = result.fields[3].toString('base64')
    const description = result.fields[4].toString('base64')
    const duration = result.fields[5].toString('base64')
    const songFileURL = result.fields[6].toString('base64')
    const artFileURL = result.fields[7].toString('base64')

    // Store TSP fields in the StorageEngine
    await this.storageEngine.storeRecord({
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
   * Deletes the output record once the UTXO has been spent
   * @param {ob} obj all params given inside an object
   * @param {string} obj.txid the transactionId the transaction the UTXO is apart of
   * @param {Number} obj.vout the index of the given UTXO
   * @param {string} obj.topic the topic this UTXO is apart of
   * @returns
   */
  async outputSpent ({ txid, vout, topic }) {
    if (topic !== 'TSP') return
    await this.storageEngine.deleteRecord({ txid, vout })
  }

  /**
   *
   * @param {object} obj all params given in an object
   * @param {object} obj.query lookup query given as an object
   * @returns {object} with the data given in an object
   */
  async lookup ({ query }) {
    // Validate Query
    if (!query) {
      const e = new Error('Lookup must include a valid query!')
      e.code = 'ERR_INVALID_QUERY'
      throw e
    }
    if (query.artistIdentityKey) {
      return await this.storageEngine.findByArtistIdentityKey({
        artistIdentityKey: query.artistIdentityKey
      })
    } else if (query.songTitle) {
      return await this.storageEngine.findBySongTitle({
        songTitle: query.songTitle
      })
    } else if (query.artistName) {
      return await this.storageEngine.findByArtistName({
        artistName: query.artistName
      })
    } else if (query.songID) {
      return await this.storageEngine.findBySongID({
        songID: query.songID
      })
    } else if (query.findAll === 'true' || query.findAll === true) {
      return await this.storageEngine.findAll()
    } 
    else {
      const e = new Error('Query parameters must include a valid Identity Key, Title, Artist Name, Song ID, or Display all!')
      e.code = 'ERR_INSUFFICIENT_QUERY_PARAMS'
      throw e
    }
  }
}
TSPLookupService.KnexStorageEngine = KnexStorageEngine
module.exports = TSPLookupService