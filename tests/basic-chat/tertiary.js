'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../libp2p.js')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const async = require('async')
const Pushable = require('pull-pushable')
const p = Pushable()
const app = require('./app.json');

async.parallel([
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-listener'), (err, idPrimary) => {
      if (err) throw err
      callback(null, idPrimary)
    })
  },
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-dialer'), (err, idSecondary) => {
      if (err) throw err
      callback(null, idSecondary)
    })
  },
  (callback) => {
    PeerId.create((err, idTertiary) => {
      if (err) throw err
      callback(null, idTertiary)
    })
  }
],(err, ids) => {
  if (err) throw err
  const peerPrimary = new PeerInfo(ids[0])
  peerPrimary.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.primary.port))
  const nodePrimary = new libp2p.Node(peerPrimary)

  const peerSecondary = new PeerInfo(ids[0])
  peerSecondary.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.secondary.port))
  const nodeSecondary = new libp2p.Node(peerSecondary)

  const peerTertiary = new PeerInfo(ids[0])
  peerTertiary.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.tertiary.port))
  const nodeTertiary = new libp2p.Node(peerTertiary)
  setStuffUp(peerPrimary, peerSecondary, nodeTertiary)
})

function setStuffUp(peerPrimary, peerSecondary, nodeTertiary) {

  nodeTertiary.start((err) => {
    if (err) throw err
    console.log('Tertiary node ready')

    nodeTertiary.dialByPeerInfo(peerPrimary, '/chat/1.0.0', (err, conn) => {
      if (err) throw err
      console.log('Tertiary node dialed to primary node')
      pull(p, conn)
      pull(conn, pull.map((data) => {return data.toString('utf8').replace('\n','')}), pull.drain(console.log))
    })/* dialer ends here */
  })
}

process.stdin.setEncoding('utf8')
process.openStdin().on('data', (chunk) => {
  var data = chunk.toString()
  p.push(data)
})
