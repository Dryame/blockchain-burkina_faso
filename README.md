# 🇧🇫 DiploChain - Certification de Diplômes sur Blockchain

DiploChain est une solution Web3 complète visant à éradiquer les faux diplômes au Burkina Faso en utilisant la blockchain Polygon (Amoy Testnet) et IPFS via Pinata.

## 🚀 Fonctionnalités
- **Admin** : Interface pour les universités permettant l'émission de diplômes (PDF + Signature Blockchain).
- **Espace Diplômé** : Visualisation du diplôme, téléchargement PDF et partage via QR Code.
- **Vérificateur** : Authentification instantanée et publique sans connexion wallet requise.

## 🛠 Installation et Configuration

1. **Installer les dépendances** :
```bash
npm install
```

2. **Configurer les variables d'environnement** :
Créez un fichier `.env` à la racine (basé sur `.env.example`) et renseignez :
- `PRIVATE_KEY` : Votre clé privée MetaMask (réseau Amoy).
- `VITE_PINATA_JWT` : Votre token API Pinata pour l'upload IPFS.

3. **Compiler et Déployer le Smart Contract** :
```bash
# Compilation des contrats
npm run compile

# Déploiement sur Polygon Amoy
npm run deploy
```
*Note : L'adresse du contrat s'affichera dans la console. Copiez-la dans `.env` sous `VITE_CONTRACT_ADDRESS`.*

4. **Lancer le frontend** :
```bash
npm run dev
```

## 🧪 Données de Test Émises par Défaut
Lors du déploiement (`npm run deploy`), deux diplômes de test sont créés :
1. **ID**: `DIPL-2024-001` - Aminata Ouédraogo
2. **ID**: `DIPL-2023-002` - Drissa Compaoré

## 📡 Architecture Technique
- **Blockchain** : Polygon Amoy (Smart Contract Solidity 0.8.20).
- **IPFS** : Pinata API pour le stockage décentralisé des PDF.
- **Frontend** : React.js, TailwindCSS (Thème Burkina Faso).
- **Web3** : Ethers.js v6.

---
*Développé comme preuve de concept pour la sécurisation du système éducatif burkinabè.*
