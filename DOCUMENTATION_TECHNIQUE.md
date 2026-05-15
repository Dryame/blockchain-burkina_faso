# Documentation Technique - DiploChain

**Projet** : Système de certification de diplômes sur blockchain (Burkina Faso)  
**Version** : 1.0.0  
**Stack** : Solidity, React, Ethers.js, IPFS (Pinata), Polygon Amoy.

---

## 1. Vision du Projet
DiploChain vise à restaurer la confiance dans le système éducatif burkinabè en rendant la falsification des diplômes mathématiquement impossible. Chaque diplôme est signé par une institution accréditée et ancré de manière immuable sur la blockchain.

## 2. Architecture Technique

### 2.1 Smart Contract (Solidity)
Le contrat `DiploChain.sol` gère deux piliers :
- **Accréditation** : Seuls les établissements validés par l'owner (le Ministère) peuvent interagir avec les fonctions d'écriture.
- **Registre Immuable** : Stocke l'empreinte numérique (Hash IPFS) et les métadonnées de l'étudiant.
- **Sécurité** : Protection contre les doublons d'ID et vérification de la propriété de l'institution.

### 2.2 Stockage Décentralisé (IPFS)
Les fichiers PDF originaux ne sont pas stockés sur la blockchain (trop coûteux). Ils sont hébergés sur **IPFS**. La blockchain ne contient que le **CID (Content Identifier)**, garantissant que le document consulté est identique à l'original émis.

### 2.3 Frontend (React & Tailwind)
- **Routing** : React Router pour séparer les espaces (Public, Étudiant, Admin).
- **Web3 Interaction** : Ethers.js v6 pour la communication avec le provider (MetaMask) et le RPC Polygon.
- **Responsive Design** : Thème sombre optimisé pour mobile et desktop.

---

## 3. Schéma des Données (Blockchain)

### Struct `Diploma`
- `fullName` : string
- `birthDate` : string
- `title` : string
- `mention` : string
- `year` : uint256
- `ipfsHash` : string (Lien vers le PDF)
- `institutionAddress` : address
- `institutionName` : string
- `timestamp` : uint256

---

## 4. Guide d'Installation

1. **Dépendances** : `npm install`
2. **Compilation** : `npm run compile`
3. **Déploiement** : `npm run deploy` (nécessite une clé privée dans `.env`)
4. **Frontend** : `npm run dev`

---

## 5. Invariants de Sécurité
- **Authenticité** : Un diplôme ne peut être émis que par un wallet accrédité.
- **Intégrité** : Le contenu du PDF ne peut être modifié sans altérer son Hash IPFS, ce qui invaliderait la preuve on-chain.
- **Disponibilité** : La vérification est publique et ne nécessite pas de connexion wallet (RPC direct).

---

## 6. Utilisation (Demo Flow)
1. **Admin** Connecte son wallet -> Rempli le formulaire -> Upload PDF -> Signe la transaction.
2. **Diplômé** Entre son matricule -> Visualise son diplôme -> Télécharge son PDF -> Partage le QR Code.
3. **Recruteur** Scanne le QR Code ou entre le matricule -> Reçoit une confirmation verte (Valide) ou un message rouge (Invalide).
