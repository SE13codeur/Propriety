export const abi: any[] = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "prix",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "date",
				"type": "uint256"
			}
		],
		"name": "MiseEnVente",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "ancienProprio",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "nouveauProprio",
				"type": "address"
			}
		],
		"name": "Vente",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "acheterPropriete",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_proprietaire",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_lat",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_long",
				"type": "uint256"
			}
		],
		"name": "ajouterPropriete",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "declarerPropriete",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_prix",
				"type": "uint256"
			}
		],
		"name": "mettreProprieteEnVente",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_latA",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_latB",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_longA",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_longB",
				"type": "uint256"
			}
		],
		"name": "localiserProprietes",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "props",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "proprieteEstEnVente",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "proprieteIndex",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address payable",
						"name": "proprietaire",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "lat",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "long",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "prix",
						"type": "uint256"
					},
					{
						"internalType": "enum MaPropriete.EtatPropriete",
						"name": "etat",
						"type": "uint8"
					}
				],
				"internalType": "struct MaPropriete.Propriete",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proprietes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "proprietaire",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "lat",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "long",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "prix",
				"type": "uint256"
			},
			{
				"internalType": "enum MaPropriete.EtatPropriete",
				"name": "etat",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalProprietes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_lat",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_long",
				"type": "uint256"
			}
		],
		"name": "trouverPropriete",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];