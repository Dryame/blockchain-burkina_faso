import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The PDF file to upload
 * @returns {Promise<string>} - The IPFS hash (CID)
 */
export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!PINATA_JWT) {
    // In dev, provide a mock or alert. But as per guidelines, build real integration.
    // If key is missing, it will throw, which is correct for production-grade.
    throw new Error("Veuillez configurer VITE_PINATA_JWT dans vos variables d'environnement.");
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `DiploChain_${file.name.replace(/\.pdf$/i, '')}_${Date.now()}`,
    keyvalues: {
      project: 'DiploChain',
      type: 'OfficialDiploma'
    }
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1, // CIDv1 is better
  });
  formData.append('pinataOptions', options);

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.IpfsHash;
  } catch (error: any) {
    console.error("Erreur IPFS Pinata:", error.response?.data || error.message);
    throw new Error("L'envoi vers IPFS a échoué. Vérifiez votre connexion ou vos clés API.");
  }
};

/**
 * Returns the public URL to access an IPFS file
 * @param {string} hash - The IPFS hash
 */
export const getIPFSUrl = (hash: string) => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
