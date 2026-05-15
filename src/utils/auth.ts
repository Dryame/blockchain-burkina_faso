import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const USER_STORAGE_KEY = 'diplo_users';
const SESSION_KEY = 'diplo_session';

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

export const saveUser = (userData: any) => {
  const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
  
  // Check if user already exists
  if (users.find((u: any) => u.email === userData.email)) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Hash password before storing
  const userToStore = {
    ...userData,
    password: hashPassword(userData.password)
  };
  
  users.push(userToStore);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};

export const findUser = (email: string, password?: string) => {
  const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
  const user = users.find((u: any) => u.email === email);
  
  if (!user) return null;
  
  if (password && user.password !== hashPassword(password)) {
    return null;
  }
  
  return user;
};

export const createSession = (user: any, rememberMe: boolean) => {
  const expiration = rememberMe ? 7 : 1; // 7 days or 1 day
  const sessionData = {
    email: user.email,
    role: user.role,
    name: user.name,
    walletAddress: user.walletAddress,
    studentId: user.studentId,
    expiresAt: Date.now() + expiration * 24 * 60 * 60 * 1000
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return sessionData;
};

export const validateSession = () => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return { isValid: false };

  try {
    const sessionData = JSON.parse(session);
    if (Date.now() > sessionData.expiresAt) {
      logoutUser();
      return { isValid: false };
    }
    return { isValid: true, user: sessionData };
  } catch (e) {
    return { isValid: false };
  }
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getUser = () => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const checkWalletAccreditation = async (address: string): Promise<boolean> => {
  try {
    if (!window.ethereum) return false;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const institution = await contract.institutions(address);
    return institution.isAccredited;
  } catch (err) {
    console.error("Accreditation check failed", err);
    return false;
  }
};

export const checkDiplomaExistsForStudent = async (studentId: string): Promise<boolean> => {
  try {
    // This requires iterating or a specific mapping in contract
    // For now, we simulate check or assume verifyDiploma(studentId) exists if ID=studentId
    // In DiploChain.sol, verifyDiploma works with ID.
    // If the studentId passed is the ID, we check it.
    const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const [_, isValid] = await contract.verifyDiploma(studentId);
    return isValid;
  } catch (err) {
    console.error("Diploma student check failed", err);
    return false;
  }
};
