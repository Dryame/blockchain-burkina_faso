export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const CONTRACT_ABI = [
  "function addInstitution(address _institution, string memory _name) external",
  "function revokeInstitution(address _institution) external",
  "function emitDiploma(string calldata _id, string calldata _fullName, string calldata _birthDate, string calldata _title, string calldata _mention, uint256 _year, string calldata _ipfsHash) external",
  "function verifyDiploma(string calldata _id) external view returns ((string fullName, string birthDate, string title, string mention, uint256 year, string ipfsHash, address institutionAddress, string institutionName, uint256 timestamp, bool exists) diploma, bool isValid)",
  "function getInstitution(address _inst) external view returns (string memory name, bool accredited)",
  "function institutions(address) public view returns (string name, bool isAccredited)",
  "event InstitutionAccredited(address indexed institution, string name)",
  "event InstitutionRevoked(address indexed institution)",
  "event DiplomaEmitted(string indexed diplomaId, address indexed institution, uint256 timestamp)"
];
