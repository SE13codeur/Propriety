import React, {Component} from 'react';
import './App.css';

import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { abi } from './abi';

interface AppState {
  contract?: Contract;
  connected?: string; 
}

class App extends Component<any, AppState>{

  public readonly state = {
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

    web3.eth.getAccounts().then(accounts => this.setState({connected: accounts[0]}));

    this.setState({contract});

  }


  public render() {
    return (
      <div className="App">

        <h1>My Propriety</h1>
        <p><i>{this.state.connected}</i></p>

        
        
      </div>
    );
  }
  
}

export default App;
