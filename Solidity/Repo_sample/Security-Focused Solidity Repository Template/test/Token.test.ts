import { expect } from "chai";
import { ethers } from "hardhat";
import { Token } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token", function () {
    let token: Token;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    
    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
        await token.deployed();
    });
    
    it("Should have correct initial supply", async function () {
        const expectedSupply = ethers.utils.parseEther("1000000");
        expect(await token.totalSupply()).to.equal(expectedSupply);
    });
    
    it("Should allow owner to mint", async function () {
        const mintAmount = ethers.utils.parseEther("1000");
        await token.mint(addr1.address, mintAmount);
        expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
    });
});
