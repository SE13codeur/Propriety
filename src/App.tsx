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

    const nbrPropriety = await contract.methods.totalProprietes().call();
    const proprieties = new Array<Propriety>();
    for (let i = 0; i < nbrPropriety; i++) {
      const propriety = await contract.methods.proprieteIndex(i).call();
      proprieties.push(this.parsePropriety(propriety))
    }
    this.setState({proprieties, contract, connected: accounts[0]});
  }


  public render() {
    return (
      <div className="App">

        <h1>My account</h1>
          <p><i>{this.state.connected}</i></p>

          <h2>My proprieties</h2>        
          {
            this.state.proprieties
            .filter(propriety => propriety.owner !== this.state.connected)
            .map((propriety, index) =>
              <div key={index}>
                <p>{propriety.id} - {propriety.owner} - {propriety.price}</p>
                <input type='text' onChange={this.changePrice(propriety)} />
                <button onClick={this.listProprietyOn(propriety)}>SELL</button>
              </div>
            )
          }

        <h2>Others proprieties</h2>        
          {
            this.state.proprieties
            .filter(propriety => propriety.owner === this.state.connected)
            .map((propriety, index) =>
              <div key={index}>
                <p>{propriety.id} - {propriety.owner} - {propriety.price}</p>
                {
                  propriety.state === ProprietyState.EN_VENTE &&
                
                <button onClick={this.buyPropriety(propriety)}>Buy</button>
                } 
              </div>
            )
          }

      </div>
    );
  }

  private changePrice(propriety: Propriety) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      propriety.price = event.currentTarget.value;
      this.updateProprieties(propriety);
    }
  }

  private updateProprieties(propriety: Propriety) {
    const proprieties: Array<Propriety> = this.state.proprieties;
    const index = proprieties.findIndex(prop => prop.id === propriety.id);

    proprieties[index] = propriety;

    this.setState({proprieties});
  }

  private listProprietyOn(propriety: Propriety) {
    return () => {
      if (this.state.contract) {
        const contract: Contract = this.state.contract!;
        contract.methods.listProprietyOn(propriety.id, Web3.utils.toWei(propriety.price))
        .send({from: this.state.connected})
          .on('transactionHash', (hash: string) => {
            console.log('tx hash', hash);
          })
          .on('confirmation', (no: number) => {
            console.log('conf', no);
          })
          .on('error', (erreur: Error) => {
            console.log(erreur);
          })
          .then((data: Object) => console.log('ok', data));
      }
    }
  }

  private buyPropriety(propriety: Propriety) {
    return () => {
      if(this.state.contract) {
        const contract: Contract = this.state.contract!;
        contract.methods.acheterPropriete(propriety.id)
        .send({from: this.state.connected, value: Web3.utils.toWei(propriety.price)})
        .on('transactionHash', (hash: string) => {
          console.log('tx hash', hash);
        })
        .on('confirmation', (no: number) => {
          console.log('conf', no);
        })
        .on('error', (error: Error) => {
          console.log('err', error.message);
        })
        .then((data: Object) => console.log('validee', data))
        
      }
    }
  }

  private parsePropriety(propriety: Array<string>): Propriety {
    return {
      id: +propriety[0],
      owner: propriety[1],
      lat: +propriety[2],
      long: +propriety[3],
      price: Web3.utils.fromWei(propriety[4], 'ether'),
      state: propriety[5],
    } as Propriety;
  }
  
}

export default App;
