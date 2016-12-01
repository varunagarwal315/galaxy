'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../libp2p.js')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const async = require('async')
const Pushable = require('pull-pushable')
const app = require('./app.json');
const p = Pushable()
let idListener

async.parallel([
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-dialer'), (err, idDialer) => {
      if (err) {
        throw err
      }
      callback(null, idDialer)
    })
  },
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-listener'), (err, idListener) => {
      if (err) {
        throw err
      }
      callback(null, idListener)
    })
  }
], (err, ids) => {
    if (err) throw err
  const peerDialer = new PeerInfo(ids[0])
  peerDialer.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.secondary.port))
  const nodeDialer = new libp2p.Node(peerDialer)

  const peerListener = new PeerInfo(ids[1])
  idListener = ids[1]
  peerListener.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/' + app.primary.port))
  nodeDialer.start((err) => {
    if (err) throw err
    console.log('Secondary node ready');
    nodeDialer.dialByPeerInfo(peerListener, '/chat/1.0.0', (err, conn) => {
      if (err) throw err
      console.log('Secondary dialed to primary node')
      pull(p, conn)
      pull(conn, pull.map((data) => {return data.toString('utf8').replace('\n','')}), pull.drain(console.log))
    })/* dialer ends here */

    // Listener for incoming connections
    // nodeDialer.handle('/secondary/1.0.0', (protocol, conn) => {
    //   pull(p, conn)
    //   pull(conn, pull.map((data) => {return data.toString('utf8').replace('\n','')}), pull.drain(console.log))
    // })/* Handler one ends */
  })
})

process.stdin.setEncoding('utf8')
process.openStdin().on('data', (chunk) => {
  var data = chunk.toString()
  p.push(data)
})
