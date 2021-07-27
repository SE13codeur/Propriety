export interface Propriety {
    id: number; 
    owner: string; // ethereum address
    lat: number;
    long: number;
  
    // price in Wei (1 ether = 10e18 Wei)
    price: string;
    state: ProprietyState;
  }
  
  // Callback pour les transactions
  export type TxCallback = (state: TransactionState, response?: any) => void;
  
  export enum ProprietyState {
    ON_SALE = '0', BEING_SALE = '1', SOLD = '2',
  }
  
  // state d'une transaction retourné par la blockchain
  export enum TransactionState {
    RECEIVED, BEING_VALIDATED, CONFIRMED, ERROR,
  }
  