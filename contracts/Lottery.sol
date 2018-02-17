pragma solidity ^0.4.17;

contract Lottery {     // define the contract with a contract keyword
    address public manager; // its public because we want to use it in the webapplication, public is usually used to flag to others wether or not this variable is easily accesible
    address[] public players; //a dynamic array that is open to viewers and has the type (and thus will be filled with) address(es)

    function Lottery() public {   // As we want to make a Constructor function for filling the manager variable instantly when the contract deploys we name the function the same as the contract
         manager = msg.sender;           // Automaticly finds out who tries to deploy an instance of the contract and thus is the manager
    }

    function enter() public payable {       //payable because some should be able to send along some amount of ether
        require(msg.value > .01 ether);     // This global function is used to mae sure that some statement is tru before the function continues. In this case that some ether is send along (in wei). the ether key word will convert the value to ether
        players.push(msg.sender);           // push the senders address into the array players
    }

    function random() private view returns (uint)  {        // this is private because it is only to be viewed or used within the contract as we do not want others to derive from it. It is view as we are not modifying anything in the contract, just generating a random number. As the number will be used in the contract it needs to return the number.
       return uint(keccak256(block.difficulty, now, players));   //keccak256 is a instance of the sha3 algo and a global function that hashes the input. block.difficuly is a global variable like msg.sender but then for the block its on. now is a timestamp like sysdate(). uint() converts the hash (and ths the hexadecimal number) into a unsigned integer.
    }

    function pickWinner() public restricted{    // resticted calls the modifier resticted
        uint index = random() % players.length; // to choose the index of the person that wins we create a local variable called index and calculate the index by doing a modulo on whatever random number random() produces and how long the players array is.
        players[index].transfer(this.balance);  // acces the address of the player that is drawn in the index variable. and transfer all of the eth that is in the current instance of the contract towards this address.
        players = new address[](0);  // reset the lottery by resetting the list of players, creating a new address type dynamic array with an inital size of 0.
    }

    modifier restricted() {             // make one central lcation for a piece of logic that will be in many functions
        require(msg.sender == manager); // We want to make sure that only the manager (or whatever address is stored in manager) will be able to initialize the pickWinner function, by checking its value (of variable manager) against the address from the entity that tries to call the function (msg.sender)
        _;                             // use the code of the functions that call the modifier name (restricted)
    }

    function getPlayers() public view returns (address[]) {     // public as everybody will need to see a list of the players inside of the players array and view because we want to only return this list not change anything in the contract. It should be reurning a dynamic array of addresses.
        return players; //return everything that is in the array players
    }
}
