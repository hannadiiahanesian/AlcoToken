// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./ERC721Token.sol";


contract AlcoToken is ERC721Token {
    constructor() public ERC721Token("AlcoToken", "ALCO") {}
}
