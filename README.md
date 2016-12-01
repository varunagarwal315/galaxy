# Galaxy
A basic version of a decentralized chat app built on js-libp2p, the network stack that powers IPFS.

https://github.com/libp2p/js-libp2p

https://github.com/ipfs/js-ipfs

## Run
For now, only a command line chat interface has been made, between two peers.
`npm install`

`cd tests/basic-chat`

Run in two separate terminals

`node primary.js`

`node secondary.js`

`node tertiary.js`

Data typed on first and second console gets send to the third.
The third console takes input as a JSON file for now :(
Input must be {"receiver":"primary/secondary", `further data`}

## Project Status
**Status:** *In active development*


## License

[MIT](LICENSE) © 2016 varunagarwal
