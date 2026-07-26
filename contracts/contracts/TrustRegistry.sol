// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TrustRegistry
/// @notice Anchors SHA-256 hashes of business documents (invoices, receipts,
/// supplier agreements, warranty certificates) on-chain so their contents
/// can be proven tamper-free later. Only the hash is stored — never the
/// underlying business data.
contract TrustRegistry {
    struct Record {
        address submitter;
        uint256 timestamp;
    }

    mapping(bytes32 => Record) public records;

    event DocumentAnchored(bytes32 indexed documentHash, address indexed submitter, uint256 timestamp);

    /// @notice Anchors a document hash. Reverts if this exact hash was already anchored,
    /// since a duplicate would mean either a hash collision or a resubmission attempt.
    function anchorDocument(bytes32 documentHash) external {
        require(records[documentHash].timestamp == 0, 'Document already anchored');
        records[documentHash] = Record(msg.sender, block.timestamp);
        emit DocumentAnchored(documentHash, msg.sender, block.timestamp);
    }

    function isAnchored(bytes32 documentHash) external view returns (bool) {
        return records[documentHash].timestamp != 0;
    }

    function getRecord(bytes32 documentHash) external view returns (address submitter, uint256 timestamp) {
        Record memory r = records[documentHash];
        return (r.submitter, r.timestamp);
    }
}
