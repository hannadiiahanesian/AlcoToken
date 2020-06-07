const truffleAssert = require("truffle-assertions");
const BigNumber = require("bignumber.js");

const AlcoToken = artifacts.require("./AlcoToken.sol");

contract("AlcoToken", (accounts) => {
  let contract;
  const idERC721Meta = "0x5b5e139f";
  const idERC721 = "0x80ac58cd";
  const idERC165 = "0x01ffc9a7";
  const nameToken = "AlcoToken";
  const symbolToken = "ALCO";
  const addressZero = "0x0000000000000000000000000000000000000000";
  const tokenId1 = 1;
  const tokenId2 = 2;
  const tokenId3 = 3;
  const tokenId4 = 4;
  const addressOfDeployer = accounts[0];
  const approvalAddress = accounts[1];
  const tokenAddress = accounts[2];
  const incorrectAddress = accounts[4];
  const noMintingAddress = accounts[5];
  const transferEvent = "Transfer";
  const approvedEvent = "Approved";
  const approvedAllEvent = "AllApproved";
  const eventTest = function (obj, arg1, arg2, arg3) {
    return obj[0] == arg1 && obj[1] == arg2 && obj[2] == arg3;
  };

  before(() => {
    return AlcoToken.deployed().then((contractInstance) => {
      contract = contractInstance;
    });
  });

  describe("1.deployment", async () => {
    it("1.1.Should be deployed successfully", async () => {
      const address = contract.address;
      console.log(`\tAddres of deployment ${address}`);
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("1.2.Supports functions of ERC721MetaData supportsInterface", async () => {
      const compiledMetaERC721 = await contract.supportsInterface.call(
        idERC721Meta
      );
      assert.equal(
        compiledMetaERC721,
        true,
        `Came back ${compiledMetaERC721} for ${idERC721Meta}`
      );
    });

    it("1.3.Name should be present and equal to what taken by constructor", async () => {
      const name = await contract.name();
      assert.equal(name, nameToken);
    });

    it("1.4.Symbol should be present and equal to what taken by constructor", async () => {
      const symbol = await contract.symbol();
      assert.equal(symbol, symbolToken);
    });
  });

  describe("2.ERC165 checking", async () => {
    it("2.1.Supporting ERC165 function supportsInterface", async () => {
      const compiledERC165 = await contract.supportsInterface.call(idERC165);
      assert.equal(
        compiledERC165,
        true,
        `Came back ${compiledERC165} for ${idERC165}`
      );
    });
  });

  describe("3.ERC721 checking", async () => {
    it("3.1.Supporting ERC721 functions", async () => {
      const erc721Complied = await contract.supportsInterface.call(idERC721);
      assert.equal(
        erc721Complied,
        true,
        `Came back ${erc721Complied} for ${idERC721}`
      );
    });
  });

  describe("4.Minting", async () => {
    it("4.1.Balance should be zero before minting", async () => {
      const balanceDeployer = await contract.balanceOf.call(addressOfDeployer);
      assert.equal(
        balanceDeployer,
        0,
        `Came back ${balanceDeployer} for balance of ${addressOfDeployer}`
      );
    });

    it("4.2.One token should be able to be minted by deployer", async () => {
      const mintTx = await contract._mint(addressOfDeployer, tokenId1);
      const { logging } = mintTx;
      const Result = logging[0].args;
      assert(
        logging[0].event == transferEvent &&
          eventTest(Result, addressZero, addressOfDeployer, tokenId1),
        "Event Transfered not emitted"
      );
      const balanceDeployerResult = await contract.balanceOf.call(addressOfDeployer);

      assert.equal(
        balanceDeployerResult,
        1,
        `Came back ${balanceDeployerResult} for balance of ${addressOfDeployer}`
      );
    });
  });

  describe("5.Test of Functions isApprovedForAll and setApprovalForAll", async () => {
    it("5.1.Approval should be set for all", async () => {
      const approvalSetForAll = await contract.setApprovalForAll(approvalAddress, true);
      const isApprovedAll = await contract.isApprovedForAll(
        addressOfDeployer,
        approvalAddress
      );

      const { logging } = approvalSetForAll;
      const Result = logging[0].args;
      assert(
        logging[0].event == approvedAllEvent &&
          eventTest(Result, addressOfDeployer, approvalAddress, true),
        "Event Transfered not emitted"
      );

      assert.equal(
        isApprovedAll,
        true,
        `Came back ${isApprovedAll} as approved for ${addressOfDeployer} as owner ${approvalAddress} as operator`
      );
    });

    it("5.2.Shouldn't be able approve itself", async () => {
      await truffleAssert.reverts(
        contract.setApprovalForAll.call(addressOfDeployer, true),
        "Approved for caller"
      );
    });
  });

  describe("6.Testing Function balanceOf ", async () => {
    it("6.1.Value should be correct for minted tokens", async () => {
      const mintedTx1 = await contract._mint(addressOfDeployer, tokenId2);
      const mintedTx2 = await contract._mint(addressOfDeployer, tokenId3);
      const mintedTx3 = await contract._mint(addressOfDeployer, tokenId4);

      const balanceDeployer = await contract.balanceOf.call(addressOfDeployer);
      assert.equal(
        balanceDeployer,
        4,
        `Came back ${balanceDeployer} for balance of ${addressOfDeployer}`
      );
    });

    it("6.2.Should return 0 for non-minting address", async () => {
      const noMintingBalance = await contract.balanceOf.call(noMintingAddress);
      assert.equal(
        noMintingBalance,
        0,
        `Came back ${noMintingBalance} for balance of ${noMintingAddress}`
      );
    });

    it("6.3.Should not be able to mint existent token", async () => {
      await truffleAssert.reverts(
        contract._mint(addressOfDeployer, tokenId1),
        "Token already minted."
      );
    });
  });

  describe("7.Function ownerOf tests", async () => {
    it("7.1.Should return right owner of minted tokens", async () => {
      const owner = await contract.ownerOf.call(tokenId1);

      assert.equal(
        owner,
        addressOfDeployer,
        `Came back ${owner} for owner of ${tokenId1}`
      );
    });

    it("7.2.Should not be able to request not yet minted tokens", async () => {
      await truffleAssert.reverts(
        contract.ownerOf.call(1234),
        "Owner request for token that wasn't minted"
      );
    });
  });

  describe("8.Testing Function getApproved", async () => {
    it("8.1.Should receive approved data on tokenID", async () => {
      const addressSet = await contract.getApproved.call(tokenId1);

      assert.equal(
        approvalAddress,
        addressSet,
        `Came back ${addressSet} as approved for ${tokenId1}`
      );
    });

    it("8.2.Should not be able to request not yet minted tokens ", async () => {
      await truffleAssert.reverts(
        contract.getApproved.call(1234),
        "Owner request for token that wasn't minted"
      );
    });
  });



  describe("9.Testing Function transferFrom", async () => {
    it("9.1.Should be able to transfer to other addresses", async () => {
      const txTransfer = await contract.transferFrom(
        addressOfDeployer,
        tokenAddress,
        tokenId4
      );
      const newOwner = await contract.ownerOf.call(tokenId4);
      assert.equal(
        newOwner,
        tokenAddress,
        `Came back ${newOwner} as new owner of ${tokenId4} `
      );
    });

    it("9.2.Should not be able to request not yet minted tokens", async () => {
      await truffleAssert.reverts(
        contract.transferFrom(addressOfDeployer, tokenAddress, 1234),
        "Request for token that wasn't minted"
      );
    });

    it("9.3.Shouldn't be able transfer tokens that don't own", async () => {
      await truffleAssert.reverts(
        contract.transferFrom(incorrectAddress, tokenAddress, tokenId1),
        "Transfer of tokens that are not owned."
      );
    });

    it("9.4.Shouldn't be able transfer to zero address", async () => {
      await truffleAssert.reverts(
        contract.transferFrom(addressOfDeployer, addressZero, tokenId1),
        "Transfer to zero address"
      );
    });
  });

  describe("10.Function approve tests", async () => {
    it("10.1.Should set approved to some address", async () => {
      const txApproved = await contract.approve(approvalAddress, tokenId1, {
        from: addressOfDeployer,
      });
      const addressSet = await contract.getApproved.call(tokenId1);
      const { logging } = txApproved;
      const Result = logging[0].args;
      assert(
        logging[0].event == approvedEvent &&
          eventTest(Result, addressOfDeployer, approvalAddress, tokenId1),
        "Event was not emitted"
      );

      assert.equal(
        approvalAddress,
        addressSet,
        `Came back ${addressSet} as approved for ${tokenId1}`
      );
    });

    it("10.2.Shouldn't be able approve transactions if not owner", async () => {
      await truffleAssert.reverts(
        contract.approve(incorrectAddress, tokenId1, {
          from: incorrectAddress,
        }),
        "Approver is not owner"
      );
    });
  });

  describe("11.Testing Function safeTransferFrom with and without data", async () => {
    it("11.1.Should be able to safetransfer to other address", async () => {
      const txTransfer = await contract.safeTransferFrom(
        addressOfDeployer,
        tokenAddress,
        tokenId3
      );
      const newOwnerTx3 = await contract.ownerOf.call(tokenId3);
      assert.equal(
        newOwnerTx3,
        tokenAddress,
        `Came back ${newOwnerTx3} as new owner of ${tokenId3} `
      );
    });

    it("11.2.Should safetransfer to other address with data", async () => {
      const txTransfer = await contract.safeTransferFrom(
        addressOfDeployer,
        tokenAddress,
        tokenId2,
        "0x123456"
      );
      const newOwnerTx2 = await contract.ownerOf.call(tokenId2);
      assert.equal(
        newOwnerTx2,
        tokenAddress,
        `Came back ${newOwnerTx2} as new owner of ${tokenId2} `
      );
    });
  });
});
