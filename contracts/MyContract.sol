
pragma solidity ^0.8.13;

contract PaymentContract {
    string public contractId;
    // Address of the borrower wallet to receive one-time payment
    address payable public borrowerWallet;
    // Address of the lender wallet to receive payments
    address payable public lenderWallet;
    // Reference payment amount (e.g., minimum or default, in wei)
    uint256 public paymentAmount;
    // Total Ether received by borrower wallet (in wei)
    uint256 public borrowerTotalReceived;
    // Total Ether received by lender wallet (in wei)
    uint256 public lenderTotalReceived;
    // Maximum total Ether allowed (set at construction, in wei)
    uint256 public capAmount;
    // Flag to track if borrower payment has been made
    bool public borrowerPaymentMade;

    // Event to log successful payments
    event PaymentReceived(address indexed sender, uint256 amount, address indexed recipient, uint256 totalReceived);

    // Constructor to set the borrower, lender wallets, reference payment amount, and cap amount
    constructor(address payable _borrowerWallet, address payable _lenderWallet, uint256 _paymentAmount, uint256 _capAmount) {
        require(_borrowerWallet != address(0), "Invalid borrower address");
        require(_lenderWallet != address(0), "Invalid lender address");
        require(_paymentAmount > 0, "Payment amount must be greater than 0");
        require(_capAmount > 0, "Cap amount must be greater than 0");
        borrowerWallet = _borrowerWallet;
        lenderWallet = _lenderWallet;
        paymentAmount = _paymentAmount;
        capAmount = _capAmount;
        borrowerPaymentMade = false;
    }

    // Function to accept payments to lender wallet up to capAmount
    // function makeLenderPayment() external payable {
    //     // Ensure some Ether is sent
    //     require(msg.value > 0, "No Ether sent");
    //     // Ensure total received by lender does not exceed capAmount
    //     require(lenderTotalReceived + msg.value <= capAmount, "Exceeds cap amount for lender");

    //     // Update lender total received
    //     lenderTotalReceived += msg.value;

    //     // Transfer the payment to the lender wallet
    //     (bool success, ) = lenderWallet.call{value: msg.value}("");
    //     require(success, "Lender payment transfer failed");

    //     // Emit event with payment details and running total
    //     emit PaymentReceived(msg.sender, msg.value, lenderWallet, lenderTotalReceived);
    // }


// Function to accept payments to a specified lender wallet up to capAmount

function makeLenderPayment(address payable lender, address borrower) external payable {
    require(msg.value > 0, "No Ether sent");
    require(
        lenderTotalReceived + msg.value <= capAmount,
        "Exceeds cap amount for lender"
    );

    lenderTotalReceived += msg.value;

    (bool success, ) = lender.call{value: msg.value}("");
    require(success, "Lender payment transfer failed");

    emit PaymentReceived(borrower, msg.value, lender, lenderTotalReceived);
}

    // Function to accept a one-time payment equal to capAmount to borrower wallet
mapping(address => bool) public borrowerPaid;

function makeBorrowerPayment(address payable recipient) external payable {
    require(!borrowerPaid[recipient], "Borrower already paid");
    require(msg.value == capAmount, "Must send exact cap amount");

    borrowerPaid[recipient] = true;

    (bool success, ) = recipient.call{value: msg.value}("");
    require(success, "Transfer failed");

    emit PaymentReceived(msg.sender, msg.value, recipient, msg.value);
}





    // Function to update the reference payment amount (restricted to borrower)
    function updatePaymentAmount(uint256 _newAmount) external {
        require(msg.sender == borrowerWallet, "Only borrower can update amount");
        require(_newAmount > 0, "New amount must be greater than 0");
        paymentAmount = _newAmount;
    }

    // Function to update the borrower wallet (restricted to borrower)
    function updateBorrowerWallet(address payable _newBorrower) external {
        require(msg.sender == borrowerWallet, "Only borrower can update wallet");
        require(_newBorrower != address(0), "Invalid new borrower address");
        borrowerWallet = _newBorrower;
    }

    // Function to update the lender wallet (restricted to lender)
    function updateLenderWallet(address payable _newLender) external {
        require(msg.sender == lenderWallet, "Only lender can update wallet");
        require(_newLender != address(0), "Invalid new lender address");
        lenderWallet = _newLender;
    }

    // Function to handle direct Ether transfers
    receive() external payable {
        revert("Use makeLenderPayment or makeBorrowerPayment to send Ether");
    }
}