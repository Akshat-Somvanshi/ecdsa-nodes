const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const fs = require('fs');

const secp = require('ethereum-cryptography/secp256k1');
const keccak = require('ethereum-cryptography/keccak');
const utils = require('ethereum-cryptography/utils');

app.use(cors());
app.use(express.json());

const balances = {
  "6968d6fd80356ec84f029abcadcb40e5d231807e": 100,
  "630a933c3f6c844db53dd6fbcc4d4456672b09bc": 50,
  "021972a4d86bdcf8365f9a801e21a5057be43f7a": 75,
};


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  console.log(address);
  console.log(balance);
  res.send({ balance });
});
async function validdata(req,res,next){
  try
  {if(!req.body.data.recipient){
    console.error("Invalid recipient");
    throw new Error('Specify the recepient!');
  }
  const validAmount = req.body.data.amount >0 ;
  if(!validAmount){
    console.error("Invalid amount");
    throw new Error('Invalid Amount');
  }}
  catch(error){
    return res.status(400).send({message:error.message});
  }
  next();
}

app.post("/send", validdata,(req, res) => {
  const { messageHash, signedResponse, data } = req.body;
  const amount = data.amount;
  const sender = data.sender;
  setInitialBalance(sender);
  setInitialBalance(data.recipient);
  try {
    const signature = Uint8Array.from(Object.values(signedResponse[0]));
    const public_key = secp.recoverPublicKey(
      messageHash,signature,signedResponse[1]
    );
    const isSigned = secp.verify(signature,messageHash,public_key);
    const Sender_valid = sender.toString()=== getAddressFromPublicKey(public_key);
    if(!Sender_valid && isSigned){
      console.error(getAddressFromPublicKey(public_key));
      throw new Error;
    }
}
  catch(error){
    return res.status(400).send({message: "Not a valid sender"});
  }
 

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[data.recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}



const getAddressFromPublicKey = (pk) => {
  console.log(pk);
  const address = utils.toHex((pk.slice(1)).slice(-20));
  return address.toString();
}

// public key  : 04272aebc5069b675fb0881eeec183b7f4e32bfa8b54e084457916ed3e7be512ea9210d3111adc840f4e7479ab6968d6fd80356ec84f029abcadcb40e5d231807e
// private key : b6f30e7a2d6861bb90205c1a30767f343e70b2cd224baa8f3ae25bd5c378e988
// address     : 6968d6fd80356ec84f029abcadcb40e5d231807e

// public key  : 043d2ead2087546a9c632c1ebc5621845c55f211706e22f9ec34550dcb2ab932b36e1e4c542e09c88dcf5258db630a933c3f6c844db53dd6fbcc4d4456672b09bc
// private key : db2d6bdd26987efaf8a62174a477978a77c12a51cc65cbe641d6bceae7d5cde4
// address     : 630a933c3f6c844db53dd6fbcc4d4456672b09bc

// public key  : 04b380c347ef7997935a89db3efb1506013479ad337270b8f26646a16a8aee157157a40fd45c60c06b0fae9cb3021972a4d86bdcf8365f9a801e21a5057be43f7a
// private key : a3718d29c19d84a5f7709f771b8067437b223b5607ccd2aefbf3d28ffde3be84
// address     : 021972a4d86bdcf8365f9a801e21a5057be43f7a