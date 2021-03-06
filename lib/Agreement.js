const promisify = require("es6-promisify");
const utils = require('./web3-utils');
const ProfileRepository = require('./ProfileRepository');
const OfferRepository = require('./OfferRepository');

const DEPLOY_GAS_LIMIT = 1500000;

class Agreement {

  constructor(contract, marketAddress) {
    this.agreementContract = contract;
    this.marketAddress = marketAddress;
  }

  async accept(transactionHashCallback) {
    var tx = await promisify(this.agreementContract.approve)({from: web3.eth.accounts[0], gas: DEPLOY_GAS_LIMIT});
    if (transactionHashCallback) {
      transactionHashCallback(tx);
    }
    await utils.waitForTransaction(tx, DEPLOY_GAS_LIMIT);
    return tx;
  }

  async reject(transactionHashCallback) {
    var tx = await promisify(this.agreementContract.reimburse)({from: web3.eth.accounts[0], gas: DEPLOY_GAS_LIMIT});
    if (transactionHashCallback) {
      transactionHashCallback(tx);
    }
    await utils.waitForTransaction(tx, DEPLOY_GAS_LIMIT);
    return tx;  
  }

  async getData() {
    const status = ['New', 'In progress', 'Accepted', 'Canceled', 'Reimbursed'];

    return {
      offer: await new OfferRepository().fromAddress(await promisify(this.agreementContract.offer)()),
      amount: web3.toDecimal(await promisify(this.agreementContract.amount)()),
      quantity: web3.toDecimal(await promisify(this.agreementContract.quantity)()),
      seller: await promisify(this.agreementContract.seller)(),
      status: status[await promisify(this.agreementContract.stage)()],
      address: this.agreementContract.address,
    }
  }
}

module.exports = Agreement;
