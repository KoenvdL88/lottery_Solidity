const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000'});
  lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address); // check if the contract has been deployed
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({     // make a transaction towards the function enter() from account[0] and send 0.2 ether along
      from: accounts[0],
      value: web3.utils.toWei('0.2','ether') // will take the 0.2 in ether and convert it to wei
    });
    const players = await lottery.methods.getPlayers().call({   // call the function getPlayers() from account[0] and store the list in the local variable players
      from: accounts[0]
    });
    assert.equal(accounts[0], players[0]);  // the address in account[0] and the address in players[0] should be the same
    assert.equal(1, players.length); // its always what the value should be, and then what the value is // the length of players should be equal to 1
  });

  it('allows multiple account to enter', async () => {
    await lottery.methods.enter().send({     // make a transaction towards the function enter() from account[0] and send 0.2 ether along
      from: accounts[0],
      value: web3.utils.toWei('0.2','ether') // will take the 0.2 in ether and convert it to wei
    });
    await lottery.methods.enter().send({     // make a transaction towards the function enter() from account[0] and send 0.2 ether along
      from: accounts[1],
      value: web3.utils.toWei('0.2','ether') // will take the 0.2 in ether and convert it to wei
    });
    await lottery.methods.enter().send({     // make a transaction towards the function enter() from account[0] and send 0.2 ether along
      from: accounts[2],
      value: web3.utils.toWei('0.2','ether') // will take the 0.2 in ether and convert it to wei
    });
    const players = await lottery.methods.getPlayers().call({   // call the function getPlayers() from account[0] and store the list in the local variable players
      from: accounts[0]
    });
    assert.equal(accounts[0], players[0]);  // the address in account[0] and the address in players[0] should be the same
    assert.equal(accounts[1], players[1]);  // the address in account[0] and the address in players[0] should be the same
    assert.equal(accounts[2], players[2]);  // the address in account[0] and the address in players[0] should be the same
    assert.equal(3, players.length); // its always what the value should be, and then what the value is // the length of players should be equal to 1
  });

  it('requires a minimum amount of ether to enter ', async () => {
 // Try Catch should oly be used on async await functions, traditional promise functions shoould use catch statements
    try {    //The javascript interpreter will try the code inside the {}, if everything goes right then nothing is done. If an error occurs in the code, the catch() statement will be triggered
    await lottery.methods.enter().send({ // send an inadiquet amount of ether to the enter() function
      from: accounts[0],
      value: 0
    });
    assert(false); //checks for truth, thus it should have errored and thus its false continueing onwards. If for some reason it did not trow an error the test will fail as assert is not false.
  } catch (err) {  // runs when an error occured
    assert(err); // check if an err object is present in the function, and thus the test in try has correctly run into an error. Thus if there is an error, whcih would be correct, it will state that the test has succeeded.
  }
  });

  it('only manager can call pickWinner', async () => {
    try {
    await lottery.methods.pickWinner().send({ //call pickWinner and we should get an error as its not the manager
      from: accounts[1] // as this is not the manager (the manager is the one that created the contract, thus account[0]), it should fail.
    });
    assert(false);
  } catch (err) {
    assert(err);
    }
  });

  it('sends money to the winner and resets the players array', async () =>{
    // we will only enter one player to avoid the randomness of the pickWinner function
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2','ether')
    });
    const initialBalance = await web3.eth.getBalance(accounts[0]); // balance after sending 2 ether towards the contract to enter the lottery. This is a function that returns the balance of a given address. Can be used for both contracts and people owned addresses.
    await lottery.methods.pickWinner().send({from: accounts[0]}); // Pick a winner, this should return the 2 eth we send to the contract as account[0] was the only participant. Minus gas costs.
    const finalBalance = await web3.eth.getBalance(accounts[0]); // balance after picWinner deposited the 2 eth back.
    const difference = finalBalance - initialBalance;  // we can't use asser.equal(), as we had to make a transaction on the function enter().send() and pickWinner().send() and thus have to pay gas to the network. So we will store the difference into a variable.
    assert(difference > web3.utils.toWei('1.8', 'ether'));// and assert that this difference can't be bigger then 1.8 ether as that would mean some really ridicolous gas prices or an error in the contract.
    const players = await lottery.methods.getPlayers().call(); // call the function getPlayers and store the value in players
    assert.equal(0,players.length); // the length of players should be equal to 0
    const balance = await web3.eth.getBalance(lottery.options.address); //get the balance of the contract and store its value in the variabel balance
    assert.equal(0,balance); // the value of balance should be equal to 0
  });
});
