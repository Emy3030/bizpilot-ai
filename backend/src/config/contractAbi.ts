export const TRUST_REGISTRY_ABI = [
  'function anchorDocument(bytes32 documentHash) external',
  'function isAnchored(bytes32 documentHash) external view returns (bool)',
  'function getRecord(bytes32 documentHash) external view returns (address submitter, uint256 timestamp)',
  'event DocumentAnchored(bytes32 indexed documentHash, address indexed submitter, uint256 timestamp)',
];
