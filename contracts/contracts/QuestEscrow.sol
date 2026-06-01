// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title QuestEscrow
 * @dev Implement all functions so `test/QuestEscrow.assessment.test.ts` passes.
 */
contract QuestEscrow is ReentrancyGuard, Ownable {
    enum QuestStatus {
        Open,
        Accepted,
        Submitted,
        Completed,
        Cancelled,
        Refunded
    }

    uint256 public constant FEE_BPS = 300;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    uint256 public questCount;
    mapping(address => uint256) public availableFees;

    constructor() Ownable(msg.sender) {}

    function _candidateStub() internal pure {
        revert("QuestEscrow: candidate implementation required");
    }

    function createQuest(
        string calldata,
        string calldata,
        uint256,
        uint256,
        uint256,
        address
    ) external payable returns (uint256) {
        _candidateStub();
    }

    function acceptQuest(uint256) external {
        _candidateStub();
    }

    function submitWork(uint256, string calldata) external {
        _candidateStub();
    }

    function approveAndPay(uint256) external {
        _candidateStub();
    }

    function claimTimeoutPayout(uint256) external {
        _candidateStub();
    }

    function cancelQuest(uint256) external {
        _candidateStub();
    }

    function refundPoster(uint256) external {
        _candidateStub();
    }

    function withdrawFees(address) external onlyOwner {
        _candidateStub();
    }

    function getAvailableFees(address) external view returns (uint256) {
        _candidateStub();
    }

    function getQuest(uint256)
        external
        view
        returns (
            address,
            address,
            string memory,
            string memory,
            uint256,
            address,
            uint256,
            uint256,
            uint256,
            uint8,
            string memory
        )
    {
        _candidateStub();
    }
}
