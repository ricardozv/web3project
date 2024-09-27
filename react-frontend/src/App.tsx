// src/App.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
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
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const App = () => {
  const [balance, setBalance] = useState<string>("0");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      console.log("Iniciando conexão com o contrato...");
      if (window.ethereum) {
        try {
          // Solicitar acesso à MetaMask
          await window.ethereum.request({ method: "eth_requestAccounts" });
          console.log("MetaMask conectada com sucesso.");

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

          setContract(contract);

          // Obter o saldo inicial do contrato
          const balance = await contract.getBalance();
          console.log("Saldo inicial obtido:", ethers.utils.formatEther(balance), "ETH");
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error("Erro ao conectar com o contrato:", error);
        }
      } else {
        alert("Por favor, instale a MetaMask para interagir com este aplicativo.");
      }
    };
    init();
  }, []);

  const handleDeposit = async () => {
    if (contract && depositAmount) {
      console.log("Iniciando depósito de:", depositAmount, "ETH");
      setLoading(true);
      try {
        const tx = await contract.deposit({ value: ethers.utils.parseEther(depositAmount) });
        console.log("Transação de depósito enviada:", tx);
        await tx.wait();
        console.log("Depósito confirmado.");
        const newBalance = await contract.getBalance();
        console.log("Novo saldo após depósito:", ethers.utils.formatEther(newBalance), "ETH");
        setBalance(ethers.utils.formatEther(newBalance));
        setDepositAmount("");
      } catch (error) {
        console.error("Erro ao realizar o depósito:", error);
        alert("Ocorreu um erro ao fazer o depósito.");
      }
      setLoading(false);
    } else {
      alert("Por favor, insira um valor válido para depositar.");
    }
  };

  const handleWithdraw = async () => {
    if (contract && withdrawAmount) {
      console.log("Iniciando retirada de:", withdrawAmount, "ETH");
      setLoading(true);
      try {
        const tx = await contract.withdraw(ethers.utils.parseEther(withdrawAmount));
        console.log("Transação de retirada enviada:", tx);
        await tx.wait();
        console.log("Retirada confirmada.");
        const newBalance = await contract.getBalance();
        console.log("Novo saldo após retirada:", ethers.utils.formatEther(newBalance), "ETH");
        setBalance(ethers.utils.formatEther(newBalance));
        setWithdrawAmount("");
      } catch (error) {
        console.error("Erro ao realizar a retirada:", error);
        alert("Ocorreu um erro ao fazer a retirada.");
      }
      setLoading(false);
    } else {
      alert("Por favor, insira um valor válido para retirar.");
    }
  };

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#4CAF50' }}>Simple Bank DApp</h1>
      <p style={{ fontSize: '1.2rem' }}>Account Balance: <strong>{parseFloat(balance).toFixed(2)} ETH</strong></p>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="number"
          step="0.01"
          placeholder="Enter amount to deposit"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
          disabled={loading}
        />
        <button onClick={handleDeposit} disabled={loading || !depositAmount} style={{ padding: '8px' }}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </div>

      <div>
        <input
          type="number"
          step="0.01"
          placeholder="Enter amount to withdraw"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
          disabled={loading}
        />
        <button onClick={handleWithdraw} disabled={loading || !withdrawAmount} style={{ padding: '8px' }}>
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
};

export default App;
