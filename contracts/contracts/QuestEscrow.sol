// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.30;

// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// /**
//  * @title QuestEscrow
//  * @dev Implement all functions so `test/QuestEscrow.assessment.test.ts` passes.
//  */
// contract QuestEscrow is ReentrancyGuard, Ownable {
//     enum QuestStatus {
//         Open,
//         Accepted,
//         Submitted,
//         Completed,
//         Cancelled,
//         Refunded
//     }

//     uint256 public constant FEE_BPS = 300;
//     uint256 public constant BPS_DENOMINATOR = 10_000;

//     uint256 public questCount;
//     mapping(address => uint256) public availableFees;

//     constructor() Ownable(msg.sender) {}

//     function _candidateStub() internal pure {
//         revert("QuestEscrow: candidate implementation required");
//     }

//     function createQuest(
//         string calldata,
//         string calldata,
//         uint256,
//         uint256,
//         uint256,
//         address
//     ) external payable returns (uint256) {
//         _candidateStub();
//     }

//     function acceptQuest(uint256) external {
//         _candidateStub();
//     }

//     function submitWork(uint256, string calldata) external {
//         _candidateStub();
//     }

//     function approveAndPay(uint256) external {
//         _candidateStub();
//     }

//     function claimTimeoutPayout(uint256) external {
//         _candidateStub();
//     }

//     function cancelQuest(uint256) external {
//         _candidateStub();
//     }

//     function refundPoster(uint256) external {
//         _candidateStub();
//     }

//     function withdrawFees(address) external onlyOwner {
//         _candidateStub();
//     }

//     function getAvailableFees(address) external view returns (uint256) {
//         _candidateStub();
//     }

//     function getQuest(uint256)
//         external
//         view
//         returns (
//             address,
//             address,
//             string memory,
//             string memory,
//             uint256,
//             address,
//             uint256,
//             uint256,
//             uint256,
//             uint8,
//             string memory
//         )
//     {
//         _candidateStub();
//     }
// }

pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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

    struct Quest {
        address poster;
        address worker;
        string title;
        string description;
        uint256 reward;
        address token;
        uint256 acceptDeadline;
        uint256 reviewPeriod;
        uint256 reviewDeadline;
        QuestStatus status;
        string deliverableUri;
    }

    uint256 public questCount;
    mapping(uint256 => Quest) private quests;
    mapping(address => uint256) public availableFees;

    event QuestCreated(uint256 indexed questId, address indexed poster, uint256 reward);
    event QuestAccepted(uint256 indexed questId, address indexed worker);
    event WorkSubmitted(uint256 indexed questId, string deliverableUri);
    event QuestCompleted(uint256 indexed questId, address indexed worker, uint256 payout);
    event QuestCancelled(uint256 indexed questId);

    constructor() Ownable(msg.sender) {}

    function createQuest(
        string calldata title,
        string calldata description,
        uint256 reward,
        uint256 acceptDeadline,
        uint256 reviewPeriod,
        address token
    ) external payable returns (uint256) {
        require(reward > 0, "Reward required");
        require(acceptDeadline > block.timestamp, "Bad deadline");

        if (token == address(0)) {
            require(msg.value == reward, "Wrong ETH amount");
        } else {
            require(msg.value == 0, "No ETH for token quest");
            IERC20(token).transferFrom(msg.sender, address(this), reward);
        }

        questCount++;
        quests[questCount] = Quest({
            poster: msg.sender,
            worker: address(0),
            title: title,
            description: description,
            reward: reward,
            token: token,
            acceptDeadline: acceptDeadline,
            reviewPeriod: reviewPeriod,
            reviewDeadline: 0,
            status: QuestStatus.Open,
            deliverableUri: ""
        });

        emit QuestCreated(questCount, msg.sender, reward);
        return questCount;
    }

    function acceptQuest(uint256 questId) external {
        Quest storage q = quests[questId];
        require(q.poster != address(0), "Quest not found");
        require(q.status == QuestStatus.Open, "Quest not open");
        require(block.timestamp <= q.acceptDeadline, "Acceptance closed");

        q.worker = msg.sender;
        q.status = QuestStatus.Accepted;

        emit QuestAccepted(questId, msg.sender);
    }

    function submitWork(uint256 questId, string calldata deliverableUri) external {
        Quest storage q = quests[questId];
        require(q.status == QuestStatus.Accepted, "Quest not accepted");
        require(msg.sender == q.worker, "Only worker");

        q.deliverableUri = deliverableUri;
        q.reviewDeadline = block.timestamp + q.reviewPeriod;
        q.status = QuestStatus.Submitted;

        emit WorkSubmitted(questId, deliverableUri);
    }

    function approveAndPay(uint256 questId) external nonReentrant {
        Quest storage q = quests[questId];
        require(msg.sender == q.poster, "Only poster");
        require(q.status == QuestStatus.Submitted, "Not submitted");

        uint256 fee = (q.reward * FEE_BPS) / BPS_DENOMINATOR;
        uint256 payout = q.reward - fee;

        availableFees[q.token] += fee;
        q.status = QuestStatus.Completed;

        _transfer(q.token, q.worker, payout);

        emit QuestCompleted(questId, q.worker, payout);
    }

    function claimTimeoutPayout(uint256 questId) external nonReentrant {
        Quest storage q = quests[questId];
        require(q.status == QuestStatus.Submitted, "Not submitted");
        require(msg.sender == q.worker, "Only worker");
        require(block.timestamp > q.reviewDeadline, "Review period active");

        uint256 fee = (q.reward * FEE_BPS) / BPS_DENOMINATOR;
        uint256 payout = q.reward - fee;

        availableFees[q.token] += fee;
        q.status = QuestStatus.Completed;

        _transfer(q.token, q.worker, payout);
    }

    function cancelQuest(uint256 questId) external nonReentrant {
        Quest storage q = quests[questId];
        require(msg.sender == q.poster, "Only poster");
        require(q.status == QuestStatus.Open, "Cannot cancel");

        q.status = QuestStatus.Cancelled;

        _transfer(q.token, q.poster, q.reward);

        emit QuestCancelled(questId);
    }

    function refundPoster(uint256 questId) external nonReentrant {
        Quest storage q = quests[questId];
        require(msg.sender == q.poster, "Only poster");
        require(q.status == QuestStatus.Submitted, "Not submitted");
        require(block.timestamp > q.reviewDeadline, "Review period active");

        q.status = QuestStatus.Refunded;

        _transfer(q.token, q.poster, q.reward);
    }

    function withdrawFees(address token) external onlyOwner nonReentrant {
        uint256 amount = availableFees[token];
        require(amount > 0, "Nothing to withdraw");
        availableFees[token] = 0;
        _transfer(token, owner(), amount);
    }

    function getAvailableFees(address token) external view returns (uint256) {
        return availableFees[token];
    }

    function getQuest(uint256 questId)
        external
        view
        returns (
            address poster,
            address worker,
            string memory title,
            string memory description,
            uint256 reward,
            address token,
            uint256 acceptDeadline,
            uint256 reviewPeriod,
            uint256 reviewDeadline,
            uint8 status,
            string memory deliverableUri
        )
    {
        Quest storage q = quests[questId];
        return (
            q.poster,
            q.worker,
            q.title,
            q.description,
            q.reward,
            q.token,
            q.acceptDeadline,
            q.reviewPeriod,
            q.reviewDeadline,
            uint8(q.status),
            q.deliverableUri
        );
    }

    function _transfer(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool sent, ) = to.call{value: amount}("");
            require(sent, "ETH transfer failed");
        } else {
            IERC20(token).transfer(to, amount);
        }
    }
}
