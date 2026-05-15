// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DiploChain
 * @dev Système de certification de diplômes pour le Burkina Faso
 * Permet aux institutions accréditées d'émettre des diplômes certifiés sur la blockchain.
 */
contract DiploChain is Ownable {
    
    struct Institution {
        string name;
        bool isAccredited;
    }

    struct Diploma {
        string fullName;
        string birthDate;
        string title;
        string mention;
        uint256 year;
        string ipfsHash;
        address institutionAddress;
        string institutionName;
        uint256 timestamp;
        bool exists;
    }

    // Mapping des institutions accréditées
    mapping(address => Institution) public institutions;
    
    // Mapping des diplômes par leur identifiant unique
    mapping(string => Diploma) private diplomas;

    // Événements
    event InstitutionAccredited(address indexed institution, string name);
    event InstitutionRevoked(address indexed institution);
    event DiplomaEmitted(string indexed diplomaId, address indexed institution, uint256 timestamp);

    /**
     * @dev Constructeur initialisant l'owner du contrat
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Modificateur pour restreindre l'accès aux institutions accréditées
     */
    modifier onlyAccredited() {
        require(institutions[msg.sender].isAccredited, "Erreur: Cette adresse n'est pas une institution accréditée.");
        _;
    }

    /**
     * @dev Ajoute ou accrédite une institution (Seul l'owner peut le faire)
     * @param _institution Adresse du wallet de l'institution
     * @param _name Nom de l'établissement
     */
    function addInstitution(address _institution, string memory _name) external onlyOwner {
        require(_institution != address(0), "Adresse invalide");
        institutions[_institution] = Institution(_name, true);
        emit InstitutionAccredited(_institution, _name);
    }

    /**
     * @dev Révoque l'accréditation d'une institution
     * @param _institution Adresse de l'institution
     */
    function revokeInstitution(address _institution) external onlyOwner {
        institutions[_institution].isAccredited = false;
        emit InstitutionRevoked(_institution);
    }

    /**
     * @dev Émet un nouveau diplôme certifié
     * @param _id Identifiant unique du diplôme (ex: Numero matricule ou UUID)
     * @param _fullName Nom complet de l'étudiant
     * @param _birthDate Date de naissance
     * @param _title Intitulé du diplôme (ex: Licence en Informatique)
     * @param _mention Mention obtenue
     * @param _year Année d'obtention
     * @param _ipfsHash Hash IPFS du document PDF
     */
    function emitDiploma(
        string calldata _id,
        string calldata _fullName,
        string calldata _birthDate,
        string calldata _title,
        string calldata _mention,
        uint256 _year,
        string calldata _ipfsHash
    ) external onlyAccredited {
        require(!diplomas[_id].exists, "Erreur: Ce numero de diplome est deja enregistre.");
        require(bytes(_ipfsHash).length > 0, "Erreur: Le hash IPFS est obligatoire.");

        diplomas[_id] = Diploma({
            fullName: _fullName,
            birthDate: _birthDate,
            title: _title,
            mention: _mention,
            year: _year,
            ipfsHash: _ipfsHash,
            institutionAddress: msg.sender,
            institutionName: institutions[msg.sender].name,
            timestamp: block.timestamp,
            exists: true
        });

        emit DiplomaEmitted(_id, msg.sender, block.timestamp);
    }

    /**
     * @dev Vérifie la validité d'un diplôme et retourne ses informations
     * @param _id Identifiant unique du diplôme
     */
    function verifyDiploma(string calldata _id) external view returns (Diploma memory, bool) {
        Diploma memory d = diplomas[_id];
        return (d, d.exists);
    }

    /**
     * @dev Retourne les informations d'une institution
     * @param _inst Adresse de l'institution
     */
    function getInstitution(address _inst) external view returns (string memory name, bool accredited) {
        return (institutions[_inst].name, institutions[_inst].isAccredited);
    }
}
