import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import abi from '../contracts/ContractABI';

import { ProprietyState, Propriety, TransactionState, TxCallback } from '../utils/types';

export const CONTRACT_ADDRESS = '0x8bEf2F8C950D23D7C34A566F5eCd14609EBaEF67';

export class ContractService {

  // web3 RPC pour les services
  private static web3: Web3 | null = null;

  // web3 Websockets pour les évènements
  private static WsWeb3: Web3 | null = null;

  constructor(
    public contract: Contract
  ) { }

  // Singleton
  public static GetWeb3(): Web3 {
    if (ContractService.web3 === null) {
      Web3.givenProvider.enable(); // Active les permissions pour le contract avec le Provider
      // Charge le provider par défault (givenProvider) qui est Metamask si l'utilisateur l'a
      // installé sur son navigateur
      ContractService.web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
    }
    return ContractService.web3!;
  }

  // Singleton for web3 Websocket
  private static GetWsWeb3(): Web3 {
    if (ContractService.WsWeb3 === null) {
      Web3.givenProvider.enable();
      // ws://127.0.0.1:7545 => Ganache Config by default
      ContractService.WsWeb3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));
    }
    return ContractService.WsWeb3!;
  }

  private static InitContract(web3: Web3): ContractService {
    return new ContractService(new web3.eth.Contract(
      abi, CONTRACT_ADDRESS, {}
    ));
  }

  // Loading the contract with RPC
  public static Contract(): ContractService {
    return ContractService.InitContract(ContractService.GetWeb3());
  }
  // Loading the contract with Websocket
  public static WsContract() {
    return ContractService.InitContract(ContractService.GetWsWeb3());
  }

  // Loading the account of user
  public static GetAccount(): Promise<string> {
    //  index = 0 by défaut
    return ContractService.GetWeb3().eth.getAccounts().then(accounts => accounts[0]);
  }

  // Loading of the 10 first proprieties
  public async getProprieties(): Promise<Array<Propriety>> {
    const numberOfProprieties = await this.contract.methods.totalProprieties().call();
    let promises = new Array<Promise<string[]>>();
    for (let i = 0; i < numberOfProprieties; i++) {
      promises.push(this.contract.methods.proprietyIndex(i).call());
    }

    return Promise.all(promises).then(
      data => data.map((d: string[]) => this.parsePropriety(d))
    );
  }

  public buyPropriety(propriety: Propriety, txCallback: TxCallback) {
    const data = this.contract.methods.buyPropriety(propriety.id).encodeABI();
    this.sendTransaction(data, {value: propriety.price}, txCallback);
  }

  public declarePropriety(propriety: Propriety, txCallback: TxCallback) {
    const data = this.contract.methods.declarePropriety(propriety.id).encodeABI();
    this.sendTransaction(data, {}, txCallback);
  }

  public listProprietyOn(propriety: Propriety, txCallback: TxCallback) {
    const data = this.contract.methods.listProprietyOn(propriety.id, Web3.utils.toWei(propriety.price)).encodeABI();
    this.sendTransaction(data, {}, txCallback);
  }

  // Send transactions, also data + state modification to the contract
  private async sendTransaction(data: string, params: any, txCallback: TxCallback) {
    let from = await ContractService.GetAccount();
    ContractService.GetWeb3().eth.sendTransaction({...params, data, from, to: CONTRACT_ADDRESS})
      .on('transactionHash', (hash: string) => {
        txCallback(TransactionState.RECEIVED, hash);
      })
      .on('confirmation', (no: number) => {
        txCallback(TransactionState.BEING_VALIDATED, no);
      })
      .on('error', (erreur: Error) => {
        txCallback(TransactionState.ERROR, erreur.message);
      })
      .then(() => txCallback(TransactionState.CONFIRMED));
  }

  private parsePropriety(data: string[]): Propriety {
    return {
      id: +data[0],
      owner: data[1],
      lat: +data[2],
      long: +data[3],
      price: data[4],
      state: data[5] as ProprietyState,
    };
  }
}
