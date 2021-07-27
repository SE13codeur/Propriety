import React from 'react';
import '../styles/App.css';

import { ContractService } from '../contracts/ContractService';

import { ProprietyState, Propriety, TransactionState } from '../utils/types';

import Web3 from 'web3';

interface AppState {
  proprieties: Array<Propriety>;

  connected?: string;
  error?: string;
  proprietyEnTraitement?: Propriety; // transaction
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
    proprietyEnTraitement: undefined,
  }

  public componentDidMount() {
    ContractService.Contrat()
      .getProprieties()
      .then(proprieties => this.setState({proprieties}));

    // Charge le compte actuellement connecté sur Metamask
    ContractService.GetCompte()
      .then(account => this.setState({connected: account}));

    // Met à jour le compte lorsque l'utilisateur en sélectionne un nouveau sur
    // Metamask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.setState({connected: accounts[0]});
      });
    }

    ContractService.wSContract().contract.events.Sale(null, (error: Error, response: any) => {
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
        owner: values.nouveauProprio,
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
            <p>Connecté <b>{this.state.connected}</b></p>
          </div>

          <div className="Title">
            <h1>Gérez vos propriétés</h1>
            <h2>En toute indépendance et transparence</h2>
            <h2>Avec <b>Ethereum</b></h2>
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
            <h1>De nouvelles propriétés chaque jour</h1>
            <div className="Properties">
              {this.renderProprieties()}
            </div>
          </section>

          <section className="White">
            <h1>Gérez vos propriétés</h1>
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
      .filter(p => this.state.connected !== propriety.owner)
      .map((propriety, index) => (
        <div key={index} className="Property">
          <div className="Property-header" style={{
            backgroundImage: `url('/${(propriety.id % 10) + 1}.jpg')`,
          }}>
            <div className="Overlay"></div>
            <p className="Tag">#{propriety.id}</p>
            <p className="Loc">({propriety.lat / 10000}, {p.long / 10000})</p>
          </div>

          <div className="Property-content">
            {
              propriety.state === ProprietyState.EN_Sale &&
                <div className="Action">
                  <p className="Label" style={{backgroundColor: '#7dcfb6'}}>En Sale</p>
                  <p className="Tenant">{propriety.owner}</p>
                  <p className="Price">{parseFloat(Web3.utils.fromWei('' + propriety.prix, 'ether')).toFixed(4)} Ξ</p>
                  <button onClick={this.acheterPropriety(Object.assign({}, propriety))}>Acheter</button>
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
            <p className="Loc">({propriety.lat / 10000}, {p.long / 10000})</p>
          </div>

          <div className="Property-content">
            {
              propriety.state === ProprietyState.ALIENEE &&
                <div className="Action">
                  <div className="Input">
                    <input type="text" value={propriety.prix} onChange={this.modifierPrixPropriety(Object.assign({}, propriety))} />
                    <label>Ξ</label>
                  </div>
                  <button onClick={this.mettreProprietyEnSale(Object.assign({}, propriety))}>Mettre en Sale</button>
                  {this.renderMessage(propriety)}
                </div>
            }
            {
              p.state === ProprietyState.BEING_SALE &&
                <div className="Action">
                  <p className="Label" style={{backgroundColor: '#777'}}>A déclarer</p>
                  <button onClick={this.declarerPropriety(Object.assign({}, propriety))}>Déclarer</button>
                  {this.renderMessage(p)}
                </div>
            }
            {
              propriety.state === ProprietyState.EN_Sale &&
                <div className="Action">
                  <p className="Label">Vous vendez</p>
                  <p className="Price">{parseFloat(Web3.utils.fromWei(propriety.prix, 'ether')).toFixed(4)} Ξ</p>
                </div>
            }
          </div>
        </div>
      ));
  }

  // Affiche message de chargement sous la propriété concernée
  private renderMessage(propriety: Propriety) {
    if (this.state.proprietyEnTraitement) {
      let proprietyEnTraitement: Propriety = this.state.proprietyEnTraitement!;
      return (
        proprietyEnTraitement.id === propriety.id &&
          <p className="Loading-message">Traitement en cours...</p>
      )
    }
    return null;
  }

  private acheterPropriety(propriety: Propriety) {
    return () => {
      this.setState({proprietyEnTraitement: propriety});
      ContractService.Contrat().acheterPropriety(propriety, (state: TransactionState, response: any) => {
        switch(state) {
          case TransactionState.EN_VALIDATION:
            console.log(response);
            break;
          case TransactionState.CONFIRMEE:
            propriety.owner = this.state.connected!;
            propriety.state = ProprietyState.BEING_SALE;
            this.updatePropriety(propriety);
            break;
          case TransactionState.ERRoR:
            this.setState({error: response});
            break;
        }
        this.setState({proprietyEnTraitement: undefined});
      });
    }
  }

  private declarerPropriety(propriety: Propriety) {
    return () => {
      this.setState({proprietyEnTraitement: propriety});
      ContractService.Contrat().declarerPropriety(propriety, (state: TransactionState, response: any) => {
        switch(state) {
          case TransactionState.EN_VALIDATION:
            console.log(response);
            break;
          case TransactionState.CONFIRMEE:
            propriety.owner = this.state.connected!;
            propriety.state = ProprietyState.ALIENEE;
            this.updatePropriety(propriety);
            break;
          case transactionState.ERRoR:
            this.setState({error: response});
            break;
        }
        this.setState({proprietyEnTraitement: undefined});
      });
    }
  }

  private mettreProprietyEnSale(propriety: Propriety) {
    return () => {
      this.setState({proprietyEnTraitement: propriety});
      ContractService.Contrat().mettreProprietyEnSale(propriety, (state: transactionState, response: any) => {
        switch(state) {
          case transactionState.EN_VALIDATION:
            console.log(response);
            break;
          case transactionState.CONFIRMEE:
            propriety.state = ProprietyState.EN_Sale;
            // Le prix est affiché en enregistré en Wei
            this.updatePropriety({...propriety, prix: Web3.utils.toWei(propriety.prix)});
            break;
          case transactionState.ERRoR:
            this.setState({error: response});
            break;
        }
        this.setState({proprietyEnTraitement: undefined});
      });
    }
  }

  private modifierPrixPropriety(propriety: Propriety) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      propriety.prix = evt.currentTarget.value;
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
