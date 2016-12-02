'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src/libp2p.js')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const async = require('async')
const Pushable = require('pull-pushable')
const app = require('./app.json')
const p = Pushable()
let idPrimary

async.parallel([
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-dialer'), (err, idSecondary) => {
      if (err) {
        throw err
      }
      callback(null, idSecondary)
    })
  },
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-listener'), (err, idPrimary) => {
      if (err) {
        throw err
      }
      callback(null, idPrimary)
    })
  }
], (err, ids) => {
    if (err) throw err
  const peerSecondary = new PeerInfo(ids[0])
  peerSecondary.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.secondary.port))
  const nodeSecondary = new libp2p.Node(peerSecondary)

  const peerPrimary = new PeerInfo(ids[1])
  idPrimary = ids[1]
  peerPrimary.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/' + app.primary.port))
  nodeSecondary.start((err) => {
    if (err) throw err
    console.log('Secondary node ready');
    nodeSecondary.swarm.on('peer-mux-established', (peerInfo) => {
      console.log('Incoming connection from ' + peerInfo.id.toB58String())
    })
    nodeSecondary.dialByPeerInfo(peerPrimary, app.primary.protocol, (err, conn) => {
      if (err) throw err
      console.log('Secondary dialed to primary node')
      pull(p, conn)
      pull(conn, pull.map((data) => {return data.toString('utf8').replace('\n','')}), pull.drain(console.log))
    })/* Secondary ends here */

    //Listens for incoming connections
    nodeSecondary.handle(app.secondary.protocol, (protocol, conn) => {
      pull(p, conn)
      pull(conn, pull.map((data) => {return data.toString('utf8').replace('\n','')}), pull.drain(console.log))
    })/* Handler one ends */
  })
})

process.stdin.setEncoding('utf8')
process.openStdin().on('data', (chunk) => {
  var data = chunk.toString()
  p.push(data)
})
