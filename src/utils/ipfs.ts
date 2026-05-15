import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Upload un fichier sur IPFS via Pinata
 * @param {File} file - Le fichier PDF à uploader
 * @returns {Promise<string>} - Le hash IPFS (CID)
 */
export const uploadToIPFS = async (file) => {
  if (!PINATA_JWT) {
    throw new Error("Clé API Pinata manquante. Veuillez vérifier votre fichier .env");
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `diplome_${Date.now()}.pdf`,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: Infinity,
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.error("Erreur IPFS Pinata:", error);
    throw error;
  }
};

/**
 * Retourne l'URL publique pour accéder à un fichier IPFS
 * @param {string} hash - Le hash IPFS
 */
export const getIPFSUrl = (hash) => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
