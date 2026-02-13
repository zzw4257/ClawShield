// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ClawShieldRegistry is Ownable {
    struct Attestation {
        bytes32 fingerprint;
        uint8 score;
        string reportURI;
        bytes32 reportHash;
        string repo;
        string commit;
        address attester;
        uint256 timestamp;
        bool revoked;
        string reasonURI;
    }

    mapping(address => bool) public isAttester;
    uint8 public maxAttestableScore;
    mapping(bytes32 => uint256) private _latestIndexPlusOne;
    mapping(bytes32 => Attestation[]) private _history;

    event Attested(
        bytes32 indexed fingerprint,
        uint8 score,
        address indexed attester,
        string reportURI,
        bytes32 reportHash,
        string repo,
        string commit,
        uint256 timestamp
    );

    event Revoked(
        bytes32 indexed fingerprint,
        address indexed attester,
        string reasonURI,
        uint256 timestamp
    );
    event MaxAttestableScoreUpdated(uint8 newMaxAttestableScore);

    error NotAttester();
    error InvalidScore();
    error EmptyField();
    error NoAttestation();
    error ScoreExceedsAttestationPolicy();

    modifier onlyAttester() {
        if (!isAttester[msg.sender]) {
            revert NotAttester();
        }
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        isAttester[initialOwner] = true;
        maxAttestableScore = 29;
    }

    function setAttester(address attester, bool allowed) external onlyOwner {
        isAttester[attester] = allowed;
    }

    function setMaxAttestableScore(uint8 newMaxAttestableScore) external onlyOwner {
        if (newMaxAttestableScore > 100) {
            revert InvalidScore();
        }
        maxAttestableScore = newMaxAttestableScore;
        emit MaxAttestableScoreUpdated(newMaxAttestableScore);
    }

    function attest(
        bytes32 fingerprint,
        uint8 score,
        string calldata reportURI,
        bytes32 reportHash,
        string calldata repo,
        string calldata commit
    ) external onlyAttester {
        if (score > 100) {
            revert InvalidScore();
        }
        if (score > maxAttestableScore) {
            revert ScoreExceedsAttestationPolicy();
        }
        if (fingerprint == bytes32(0) || reportHash == bytes32(0)) {
            revert EmptyField();
        }
        if (bytes(reportURI).length == 0 || bytes(repo).length == 0 || bytes(commit).length == 0) {
            revert EmptyField();
        }

        Attestation memory item = Attestation({
            fingerprint: fingerprint,
            score: score,
            reportURI: reportURI,
            reportHash: reportHash,
            repo: repo,
            commit: commit,
            attester: msg.sender,
            timestamp: block.timestamp,
            revoked: false,
            reasonURI: ""
        });

        _history[fingerprint].push(item);
        _latestIndexPlusOne[fingerprint] = _history[fingerprint].length;

        emit Attested(fingerprint, score, msg.sender, reportURI, reportHash, repo, commit, block.timestamp);
    }

    function revoke(bytes32 fingerprint, string calldata reasonURI) external {
        uint256 latestIndexPlusOne = _latestIndexPlusOne[fingerprint];
        if (latestIndexPlusOne == 0) {
            revert NoAttestation();
        }
        Attestation storage latest = _history[fingerprint][latestIndexPlusOne - 1];
        bool authorized = msg.sender == owner() || msg.sender == latest.attester;
        if (!authorized) {
            revert NotAttester();
        }

        latest.revoked = true;
        latest.reasonURI = reasonURI;

        emit Revoked(fingerprint, msg.sender, reasonURI, block.timestamp);
    }

    function getLatest(bytes32 fingerprint) external view returns (Attestation memory) {
        uint256 latestIndexPlusOne = _latestIndexPlusOne[fingerprint];
        if (latestIndexPlusOne == 0) {
            revert NoAttestation();
        }
        return _history[fingerprint][latestIndexPlusOne - 1];
    }

    function getHistory(bytes32 fingerprint) external view returns (Attestation[] memory) {
        return _history[fingerprint];
    }
}
