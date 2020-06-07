const AlcoToken = artifacts.require("AlcoToken");

module.exports = function (deployer) {
  deployer.deploy(AlcoToken);
};
