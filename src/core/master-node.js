'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id');
const PeerInfo = require('peer-info');
const libp2p = require('../../src/libp2p.js');
const multiaddr = require('multiaddr');
const pull = require('pull-stream');
const Pushable = require('pull-pushable');
const EE = require('events').EventEmitter;
const p1 = Pushable();
const p2 = Pushable();
let peerBook = [];

PeerId.createFromJSON(require('./peer-id-master'), (err, idMaster) => {
  if (err) throw err;
  const peerMaster = new PeerInfo(idMaster);
  peerMaster.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + "1000"));
  const nodeMaster = new libp2p.Node(peerMaster);
  nodeMaster.start(err => {
    if (err) throw err;

    nodeMaster.handle('master-protocol-one', (protocol, conn) => {
      pull(conn, pull.drain(data => handleData(data.toString()));
      pull(p1, conn);
    })/* Handler one ends */

    nodeMaster.handle('master-protocol-two', (protocol, conn) => {
      pull(conn, pull.drain(data => handleData(data.toString()));
      pull(p2, conn);
    })/* Handler one ends */
  })
});

function handleData(data) {
  try {
    const data = JSON.parse(data);
    if (data.type === 'newPeer') {
      // Broadcast message and peer details to all connected peers
      peerBook.push(data.peerId);
      EE.emit('newPeerJoined', data);
    }
  } catch (e) {
    console.log(e);
  }
}

EE.on('newPeerJoined', (data) => {
  p1.push(data);
  p2.push(data);
})

EE.on('sendPeerInfo', (data, p) => {
  p.push(data)
})
