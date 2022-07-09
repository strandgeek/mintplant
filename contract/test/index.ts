import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const MintPlant = await ethers.getContractFactory("MintPlant");
    const mintplant = await MintPlant.deploy();
    await mintplant.deployed();

    const [deployer] = await ethers.getSigners();
    console.log(deployer);

    expect(await mintplant.safeMint(deployer.address, "ipfs://12345")).to.equal(
      "Hello, world!"
    );

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
