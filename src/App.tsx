import React, {Component} from 'react';
import './App.css';

import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { abi } from './abi';

enum ProprietyState {
  EN_VENTE = '0',
  EN_PASSATION = '1',
  ALIENE = '2'
}

interface Propriety {
  id: number;
  owner: string;
  lat: number;
  long: number;
  price: string;
  state: ProprietyState;
}

interface AppState {
  proprieties: Array<Propriety>;
  contract?: Contract;
  connected?: string; 
}

class App extends Component<any, AppState>{

  public readonly state = {
    proprieties: new Array<Propriety>(),
    contract: undefined,
    connected: undefined
  }

  // first render
  public async componentDidMount() {
    // authorisation
    Web3.givenProvider.enable()
  //   connectToWeb3 = () => {
  //     if (window.ethereum) {
  //         window.ethereum.request({method: 'eth_requestAccounts'}).then((result) => {

  //             window.ethereum.on('accountsChanged', (accounts) => {
  //                 this.web3ProcessData(accounts);
  //             });

  //             this.web3ProcessData(result);

  //         }).catch((error) => {
  //             this.setErrors(error.message);
  //         });
  //     } else {
  //         const state = {...this.state};
  //         state.errors = "Install Metamask";
  //         this.setState(state);
  //     }
  // }

    // givenProvider is the default provider installed by user: Metamask for example
    const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");

    // contract initialisation
    const contract = new web3.eth.Contract(abi, '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8', {});

    // web3.eth.getAccounts().then(accounts => this.setState({connected: accounts[0]}));

    const accounts = await web3.eth.getAccounts();
    this.setState({connected: accounts[0]});

    this.setState({contract});

    const nbrPropriety = await contract.methods.totalProprietes().call();
    const proprieties = new Array<Propriety>();
    for (let i = 0; i < nbrPropriety; i++) {
      const propriety = await contract.methods.proprieteIndex(i).call();
      proprieties.push(this.parsePropriety(propriety))
    }
    this.setState({proprieties});
  }


  public render() {
    return (
      <div className="App">

        <h1>My account</h1>
          <p><i>{this.state.connected}</i></p>

        <h2>My proprieties</h2>        
          {
            this.state.proprieties
            .filter(propriety => propriety.owner === this.state.connected)
            .map((propriety, index) =>
              <div key={index}>
                <p>{propriety.id} - {propriety.owner} - {propriety.price}</p>
              </div>
            )
          }

        <h2>Others proprieties</h2>        
          {
            this.state.proprieties
            .filter(propriety => propriety.owner !== this.state.connected)
            .map((propriety, index) =>
              <div key={index}>
                <p>{propriety.id} - {propriety.owner} - {propriety.price}</p>
              </div>
            )
          }

      </div>
    );
  }

  private parsePropriety(propriety: Array<string>): Propriety {
    return {
      id: +propriety[0],
      owner: propriety[1],
      lat: +propriety[2],
      long: +propriety[3],
      price: propriety[4],
      state: propriety[5],
    } as Propriety;
  }
  
}

export default App;
