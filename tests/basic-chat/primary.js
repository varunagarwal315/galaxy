'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src/libp2p.js')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')
const app = require('./app.json');
const p = Pushable()

PeerId.createFromJSON(require('./peer-id-listener'), (err, idPrimary) => {
  if (err) throw err
  setStuffUp(idPrimary);
})

function setStuffUp(idPrimary) {
  const peerPrimary = new PeerInfo(idPrimary)
  peerPrimary.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + app.primary.port))
  const nodePrimary = new libp2p.Node(peerPrimary)
  nodePrimary.start((err) => {
    if (err) throw err
    nodePrimary.swarm.on('peer-mux-established', (peerInfo) => {
      console.log('Incoming connection from ' + peerInfo.id.toB58String())
    })
    console.log('PRIMARY Primary ready, listening on:')
    peerPrimary.multiaddrs.forEach((ma) => {
      console.log(ma.toString() + '/ipfs/' + idPrimary.toB58String())
    })

    // Handles a protocol, allowing other nodes to dial to it and communicate
    nodePrimary.handle(app.primary.protocol, (protocol, conn) => {
      pull(p, conn)
      pull(conn, pull.map((data) => {return data.toString('utf8').replace('\n','')}), pull.drain(console.log))
    })/* Handler one ends */
  })
}

process.stdin.setEncoding('utf8')
process.openStdin().on('data', (chunk) => {
  var data = chunk.toString()
  p.push(data)
})
