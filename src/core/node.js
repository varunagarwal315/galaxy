'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src/libp2p.js')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')
const async = require('async')
const p = Pushable()
let initPayload;

async.parallel([
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-master'), (err, idMaster) => {
      if (err) {
        throw err
      }
      callback(null, idMaster)
    })
  },
  (callback) => {
    PeerId.create((err, idSelf) => {
      if (err) {
        throw err
      }
      callback(null, idSelf)
    })
  }
], (err, ids) => {
  if (err) {
    throw err;
  }
  const peerMaster = new PeerInfo(ids[0]);
  peerMaster.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/' + "1000"));
  const nodeMaster = new libp2p.Node(peerMaster);

  const peerSelf = new PeerInfo(ids[1]);
  peerSelf.multiaddr.add(multiaddr('/ip4/0.0.0.1/tcp/' + "1000"));
  const nodeSelf = new libp2p.Node(peerSelf);
  payload = {
    type: "newPeer".
    peerId: peerSelf.toPrint();
  }
  nodeSelf.start(err => {
    if (err) throw err;
    nodeSelf.dialByPeerInfo(peerMaster, 'master-protocol', (err, con) => {
      pull(conn, pull.drain(data => handleData(data.toString())));
      pull(payload, conn); // Notify master node with these details
    })
  })
});

function handleData(data) {

}
