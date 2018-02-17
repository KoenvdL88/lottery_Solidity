const HDWalletProvider = require('truffle-hdwallet-provider'); // make use of the truffle-hdwallet-provider module
const Web3 = require('web3');
const {interface, bytecode} = require('./compile') // 1 dot (.) because the compile file is only one step away instead of two in the test file.

const provider = new HDWalletProvider(
  'parrot pencil play pencil income giant best parrot picnic reject cycle umbrella',          //first argument is the mnemonic of the Metamask wallet we made earlier with Rinkerby test ethereum in it
  'https://rinkeby.infura.io/J0Jb7HCkbwl3FdJrwjaM'  // second argument is the infura API token
);

const web3 = new Web3(provider); // assign the provider variable to the Web3 Constructor making a new instance of web3

const deploy = async () => {                      // This is a function because we cannot use async and await outside of functions
  const accounts = await web3.eth.getAccounts();  // get the accounts that are linked to the provider, using the newly made instance of web3 on line 10

  console.log('attempting to deploy from account', accounts[0]); // see which account is getting used to deploy

  const result = await new web3.eth.Contract(JSON.parse(interface)) // Make the contract out of the interface we got from the compile file
    .deploy({ data: bytecode}) // initial argument of the Constructor variable in the contract and deploy the contract using the bytecode from the compile file
    .send({gas: '1000000', from: accounts[0]}); // make the transaction (and thus deploy) the contract using 1000000 gas and using the first account in the list of accounts

  console.log('Contract deployed to', result.options.address); //Look up the the address in the property options in the newly deployed contract
};
deploy(); // run the function
