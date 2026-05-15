import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

/**
 * Récupère le contrat avec un signer (pour les transactions)
 */
export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask n'est pas installé");
  if (!CONTRACT_ADDRESS) throw new Error("Erreur: Adresse du contrat manquante dans la configuration.");
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Récupère le contrat avec un provider simple (pour lectures publiques)
 */
export const getContractReadOnly = () => {
  if (!CONTRACT_ADDRESS) throw new Error("Erreur: Adresse du contrat manquante.");
  
  // On utilise le RPC de Polygon Amoy pour la lecture publique
  const rpcUrl = "https://rpc-amoy.polygon.technology";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

/**
 * Formate les erreurs de la blockchain pour un affichage utilisateur
 */
export const formatBlockchainError = (error) => {
  if (typeof error === "string") return error;
  if (error.message && error.message.includes("Adresse du contrat manquante")) return error.message;
  if (error.reason) return error.reason;
  if (error.message.includes("user rejected action")) return "Transaction annulée par l'utilisateur.";
  if (error.message.includes("insufficient funds")) return "Fonds insuffisants pour payer les frais de gaz.";
  if (error.message.includes("already registered")) return "Ce numéro de diplôme est déjà enregistré.";
  return "Une erreur inconnue est survenue sur la blockchain.";
};
