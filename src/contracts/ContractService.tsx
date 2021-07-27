import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import abi from '../contracts/ContractABI';

import { ProprietyState, Propriety, TransactionState, TxCallback } from '../utils/types';

export const CONTRACT_ADDRESS = '';

export class ContractService {

  // web3 RPC pour les services
  private static web3: Web3 | null = null;

  // web3 Websockets pour les évènements
  private static web3WS: Web3 | null = null;

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
  private static GetWeb3WS(): Web3 {
    if (ContractService.web3WS === null) {
      Web3.givenProvider.enable();
      // ws://127.0.0.1:7545 => Ganache Config by default
      ContractService.web3WS = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));
    }
    return ContractService.web3WS!;
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
    return ContractService.InitContract(ContractService.GetWeb3WS());
  }

  // Loading the account of user
  public static GetCompte(): Promise<string> {
    // Prend le compte index = 0 par défaut
    return ContractService.GetWeb3().eth.getAccounts().then(accs => accs[0]);
  }

  // Charge les dix premières propriétés
  public async getProprietys(): Promise<Array<Propriety>> {
    const nbProprietys = await this.contract.methods.totalProprietys().call();
    let promises = new Array<Promise<string[]>>();
    for (let i = 0; i < nbProprietys; i++) {
      promises.push(this.contract.methods.proprietyIndex(i).call());
    }

    return Promise.all(promises).then(
      data => data.map((d: string[]) => this.parsePropriety(d))
    );
  }

  public acheterPropriety(p: Propriety, txCallback: TxCallback) {
    const data = this.contract.methods.acheterPropriety(p.id).encodeABI();
    this.envoyerTransaction(data, {value: p.prix}, txCallback);
  }

  public declarerPropriety(p: Propriety, txCallback: TxCallback) {
    const data = this.contract.methods.declarerPropriety(p.id).encodeABI();
    this.envoyerTransaction(data, {}, txCallback);
  }

  public mettreProprietyEnVente(p: Propriety, txCallback: TxCallback) {
    const data = this.contract.methods.mettreProprietyEnVente(p.id, Web3.utils.toWei(p.prix)).encodeABI();
    this.envoyerTransaction(data, {}, txCallback);
  }

  // Envoie les transactions incluant des données et modification d'état dans le contract
  private async envoyerTransaction(data: string, params: any, txCallback: TxCallback) {
    let from = await ContractService.GetCompte();
    ContractService.GetWeb3().eth.sendTransaction({...params, data, from, to: CONTRACT_ADDRESS})
      .on('transactionHash', (hash: string) => {
        txCallback(TransactionState.RECUE, hash);
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
      proprietaire: data[1],
      lat: +data[2],
      long: +data[3],
      prix: data[4],
      etat: data[5] as ProprietyState,
    };
  }
}
