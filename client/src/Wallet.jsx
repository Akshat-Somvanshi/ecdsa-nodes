import server from './server';
import * as secp from 'ethereum-cryptography/secp256k1';
import * as utils from 'ethereum-cryptography/utils';

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const public_key = secp.getPublicKey(privateKey);
    console.log('Private Key: ', privateKey);
    console.log('Public Key: ', utils.toHex((public_key)));
    const address = utils.toHex((public_key.slice(1)).slice(-20));
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key to sign message
        <input placeholder="Enter your Private Key" value={privateKey} onChange={onChange}></input>
      </label>
      <div>
        Address: {address}
      </div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
