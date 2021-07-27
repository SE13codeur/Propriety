import React from 'react';
import '../styles/App.css';

import { ContractService } from '../contracts/ContractService';

import { ProprietyState, Propriety, TransactionState } from '../utils/types';

import Web3 from 'web3';

interface AppState {
  proprieties: Array<Propriety>;

  connected?: string;
  error?: string;
  beingProcessedTransaction?: Propriety;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

class App extends React.Component<any, AppState> {

  public readonly state = {
    proprieties: new Array<Propriety>(),

    connected: undefined,
    error: undefined,
    beingProcessedTransaction: undefined,
  }

  public componentDidMount() {
    ContractService.Contract()
      .getProprieties()
      .then(proprieties => this.setState({proprieties}));

    // loading account connected on Metamask
    ContractService.GetAccount()
      .then(account => this.setState({connected: account}));

    // Met à jour le compte lorsque l'utilisateur en sélectionne un nouveau sur
    // Metamask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.setState({connected: accounts[0]});
      });
    }

    ContractService.WsContract().contract.events.Sale(null, (error: Error, response: any) => {
      if (error) {
        console.warn('ws', error);
        return;
      }

      // https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events
      const values = response.returnValues;
      const propriety = this.state.proprieties.find(propriety => propriety.id === +values.id);

      // update during a sale
      this.updatePropriety({
        ...propriety,
        owner: values.newOwner,
        state: ProprietyState.BEING_SALE,
      } as Propriety);
    });
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="Overlay"></div>
          <div className="Account">
            <p>Connected <b>{this.state.connected}</b></p>
          </div>

          <div className="Title">
            <h1>Manage your proprieties</h1>
            <h2>With Blockchain Philosophy</h2>
            <h2>With <b>Ethereum</b></h2>
          </div>
        </header>

        <div className="Content">
          {
            this.state.error &&
              <p className="Error">
                {this.state.error}
              </p>
          }

          <section className="Green">
            <h1>Each day, we have new proprieties</h1>
            <div className="Properties">
              {this.renderProprieties()}
            </div>
          </section>

          <section className="White">
            <h1>Manage your proprieties</h1>
            <div className="Properties">
              {this.renderMyProprieties()}
            </div>
          </section>
        </div>
      </div>
    )
  }

  private renderProprieties() {
    return this.state.proprieties
      .filter(propriety => this.state.connected !== propriety.owner)
      .map((propriety, index) => (
        <div key={index} className="Property">
          <div className="Property-header" style={{
            backgroundImage: `url('/${(propriety.id % 10) + 1}.jpg')`,
          }}>
            <div className="Overlay"></div>
            <p className="Tag">#{propriety.id}</p>
            <p className="Loc">({propriety.lat / 10000}, {propriety.long / 10000})</p>
          </div>

          <div className="Property-content">
            {
              propriety.state === ProprietyState.ON_SALE &&
                <div className="Action">
                  <p className="Label" style={{backgroundColor: '#7dcfb6'}}>On sale</p>
                  <p className="Tenant">{propriety.owner}</p>
                  <p className="Price">{parseFloat(Web3.utils.fromWei('' + propriety.price, 'ether')).toFixed(4)} Ξ</p>
                  <button onClick={this.buyPropriety(Object.assign({}, propriety))}>Buy</button>
                  {this.renderMessage(propriety)}
                </div>
            }
          </div>
        </div>
    ));
  }

  private renderMyProprieties() {
    return this.state.proprieties
      // Liste uniquement les propriétés
      .filter(propriety => this.state.connected === propriety.owner)
      .map((propriety, index) => (
        <div key={index} className="Property">
          <div className="Property-header" style={{
            backgroundImage: `url('/${(propriety.id % 10) + 1}.jpg')`,
          }}>
            <div className="Overlay"></div>
            <p className="Tag">#{propriety.id}</p>
            <p className="Loc">({propriety.lat / 10000}, {propriety.long / 10000})</p>
          </div>

          <div className="Property-content">
            {
              propriety.state === ProprietyState.SOLD &&
                <div className="Action">
                  <div className="Input">
                    <input type="text" value={propriety.price} onChange={this.modifierpricePropriety(Object.assign({}, propriety))} />
                    <label>Ξ</label>
                  </div>
                  <button onClick={this.listProprietyOn(Object.assign({}, propriety))}>Mettre en Sale</button>
                  {this.renderMessage(propriety)}
                </div>
            }
            {
              propriety.state === ProprietyState.BEING_SALE &&
                <div className="Action">
                  <p className="Label" style={{backgroundColor: '#777'}}>To declare</p>
                  <button onClick={this.declarePropriety(Object.assign({}, propriety))}>Declare</button>
                  {this.renderMessage(propriety)}
                </div>
            }
            {
              propriety.state === ProprietyState.ON_SALE &&
                <div className="Action">
                  <p className="Label">You sale</p>
                  <p className="Price">{parseFloat(Web3.utils.fromWei(propriety.price, 'ether')).toFixed(4)} Ξ</p>
                </div>
            }
          </div>
        </div>
      ));
  }

  // Affiche message de chargement sous la propriété concernée
  private renderMessage(propriety: Propriety) {
    if (this.state.beingProcessedTransaction) {
      let beingProcessedTransaction: Propriety = this.state.beingProcessedTransaction!;
      return (
        beingProcessedTransaction.id === propriety.id &&
          <p className="Loading-message">Transaction is going on...</p>
      )
    }
    return null;
  }

  private buyPropriety(propriety: Propriety) {
    return () => {
      this.setState({beingProcessedTransaction: propriety});
      ContractService.Contract().buyPropriety(propriety, (state: TransactionState, response: any) => {
        switch(state) {
          case TransactionState.BEING_VALIDATED:
            console.log(response);
            break;
          case TransactionState.CONFIRMED:
            propriety.owner = this.state.connected!;
            propriety.state = ProprietyState.BEING_SALE;
            this.updatePropriety(propriety);
            break;
          case TransactionState.ERROR:
            this.setState({error: response});
            break;
        }
        this.setState({beingProcessedTransaction: undefined});
      });
    }
  }

  private declarePropriety(propriety: Propriety) {
    return () => {
      this.setState({beingProcessedTransaction: propriety});
      ContractService.Contract().declarePropriety(propriety, (state: TransactionState, response: any) => {
        switch(state) {
          case TransactionState.BEING_VALIDATED:
            console.log(response);
            break;
          case TransactionState.CONFIRMED:
            propriety.owner = this.state.connected!;
            propriety.state = ProprietyState.SOLD;
            this.updatePropriety(propriety);
            break;
          case TransactionState.ERROR:
            this.setState({error: response});
            break;
        }
        this.setState({beingProcessedTransaction: undefined});
      });
    }
  }

  private listProprietyOn(propriety: Propriety) {
    return () => {
      this.setState({beingProcessedTransaction: propriety});
      ContractService.Contract().listProprietyOn(propriety, (state: TransactionState, response: any) => {
        switch(state) {
          case TransactionState.BEING_VALIDATED:
            console.log(response);
            break;
          case TransactionState.CONFIRMED:
            propriety.state = ProprietyState.ON_SALE;
            // Le price est affiché en enregistré en Wei
            this.updatePropriety({...propriety, price: Web3.utils.toWei(propriety.price)});
            break;
          case TransactionState.ERROR:
            this.setState({error: response});
            break;
        }
        this.setState({beingProcessedTransaction: undefined});
      });
    }
  }

  private modifierpricePropriety(propriety: Propriety) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      propriety.price = evt.currentTarget.value;
      this.updatePropriety(propriety);
    }
  }

  private updatePropriety(propriety: Propriety) {
    const proprieties: Propriety[] = Object.assign([], this.state.proprieties);
    const index = proprieties.findIndex(prop => prop.id === propriety.id);

    // refresh proprieties by updating the array
    proprieties[index] = propriety;
    this.setState({proprieties, error: undefined});
  }
}

export default App;
