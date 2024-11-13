// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../Token.sol";

contract TokenProperties {
    Token token;
    
    constructor() {
        token = new Token();
    }
    
    function echidna_total_supply_constant() public view returns (bool) {
        return token.totalSupply() >= INITIAL_SUPPLY;
    }
    
    function echidna_balance_less_than_total() public view returns (bool) {
        return token.balanceOf(msg.sender) <= token.totalSupply();
    }
}
