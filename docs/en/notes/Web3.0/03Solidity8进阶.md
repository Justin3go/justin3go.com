# Solidity8 进阶

## ERC20 合约
ERC20 的合约只包括接口，只要实现了这些接口就符合 ERC20 的标准。

```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

interface IERC20 {

  // 当前合约的 token 总量

  function totalSupply() external view returns (uint);

  // 某一个账户的当前余额

  function balanceOf(address account) external view returns (uint);

  // 把账户中的余额由当前调用者发送到另一个账户中，这是一个写入方法，所以会汇报事件

  function transfer(address recipient, uint amount) external returns (bool);

  // 查询某一个账户对另一个账户的批准额度有多少

  function allowance(address owner, address spender) external view returns (uint);

  // 把我账户的数量批准给另一个账户

  function approve(address spender, uint amount) external returns (bool);

  // 我们向另一个合约存款的时候，另一个合约必须调用 transferFrom 方法才可以把我们账户中的 token 拿到他的合约中

  function transferFrom(

    address sender,

    address recipient,

    uint amount

  ) external returns (bool);

  

  event Transfer(address indexed from, address indexed to, uint amount);

  event Approval(address indexed owner, address indexed spender, uint amount);

}
```
## 例子--多签合约
合约中必须有多个人同意的情况下，才能将铸币向外转出。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract MultiSigWallet {

    event Deposit(address indexed sender, uint256 amount);

    event Submit(uint256 indexed txId);

    event Approve(address indexed owner, uint256 indexed txId);

    event Revoke(address indexed owner, uint256 indexed txId);

    event Execute(uint256 indexed txId);

  

    struct Transaction {

        address to;

        uint256 value;

        bytes data;

        bool executed;

    }

  

    address[] public owners;

    mapping(address => bool) public isOwner; // 判断是不是合约中的签名人

    uint256 public required; // 最少多少人同意才能转出这笔钱

  

    Transaction[] public transactions; // 这个数组的索引值就是我们交易的 ID 号

    // ID => (签名人是否同意这笔交易)

    mapping(uint256 => mapping(address => bool)) public approved;

  

    modifier onlyOwner() {

        require(isOwner[msg.sender], "not owner");

        _;

    }

  

    modifier txExists(uint _txId){

      require(_txId < transactions.length, "tx does not exist");

      _;

    }

  

    modifier notApproved(uint _txId) {

      require(!approved[_txId][msg.sender], "tx already executed");

      _;

    }

  

    modifier notExecuted(uint _txId) {

      require(!transactions[_txId].executed, "tx already executed");

      _;

    }

  

    constructor(address[] memory _owners, uint256 _required) {

        require(_owners.length > 0, "owners required");

        require(

            _required > 0 && _required <= _owners.length,

            "invalid required number of owners"

        );

        // 再验证每个地址都是有效的地址，不能是零地址，以前没添加，然后添加...

        for (uint256 i; i < _owners.length; i++) {

            address owner = _owners[i];

  

            require(owner != address(0), "invalid owner");

            require(!isOwner[owner], "owner is not unique");

  

            isOwner[owner] = true;

            owners.push(owner);

        }

        required = _required;

    }

  

    // 合约可以接受铸币

    receive() external payable {

        emit Deposit(msg.sender, msg.value);

    }

  

    function submit(

        address _to,

        uint256 _value,

        bytes calldata _data

    ) external onlyOwner {

        transactions.push(

            Transaction({to: _to, value: _value, data: _data, executed: false})

        );

        emit Submit(transactions.length - 1);

    }

  

    function approve(uint _txId)

        external

        onlyOwner

        txExists(_txId)

        notApproved(_txId)

        notExecuted(_txId)

    {

      approved[_txId][msg.sender] = true;

      emit Approve(msg.sender, _txId);

    }

    // 计算某个交易下多少人同意

    function _getApprovalCount(uint _txId) private view returns (uint count) {

      for(uint i; i < owners.length; i++){

        if(approved[_txId][owners[i]]) {

          count += 1;

        }

      }

    }

  

    function execute(uint _txId) external txExists(_txId) notExecuted(_txId){

      require(_getApprovalCount(_txId) >= required, "approvals < required");

      Transaction storage transaction = transactions[_txId];

  

      transaction.executed = true;

  

      (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);

      require(success, "tx failed");

  

      emit Execute(_txId);

    }

  

    function revoke(uint _txId) external onlyOwner txExists(_txId) notExecuted(_txId){

      require(approved[_txId][msg.sender], "tx not approved");

      approved[_txId][msg.sender] = false;

      emit Revoke(msg.sender, _txId);

    }

}
```
## 函数签名
呼叫一个函数的数据，由两部分组成，第一部分就是函数的选择器，也就是函数的签名，第二部分就是参数，那么智能合约的虚拟器是如何知道这个函数的签名（transfer）对应着这个呢（0xa9095cbb），通过打包参数然后哈希。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

// 模拟获取函数签名

contract FunctionSelector {

  function getSelector(string calldata _func) external pure returns (bytes4) {

    return bytes4(keccak256(bytes(_func)));

  }

}

  

contract Receiver {

  event Log(bytes data);

  

  function transfer(address _to, uint _amount) external {

    emit Log(msg.data);

  }

}
```
![](https://oss.justin3go.com/blogs/Pasted%20image%2020220620162504.png)
这个就和我们刚才调用这个函数获取到地 msg.data 是一样的
## 荷兰拍卖
由一个起拍价开始，随着时间的流逝，价格会变得越来越低，也就是谁最先出价，谁就能得到这件拍品。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

interface IERC721 {

    function transferFrom(

        address _from,

        address _to,

        uint256 _nftId

    ) external;

}

  

contract DutchAuction {

    uint private constant DURATION = 7 days;

  

    IERC721 public immutable nft;

    uint public immutable nftId;

  

    address payable public immutable seller;

    uint public immutable startingPrice;

    uint public immutable startAt;

    uint public immutable expiresAt;

    uint public immutable discountRate;

  

    constructor(

        uint _startingPrice,

        uint _discountRate,

        address _nft,

        uint _nftId

    ) {

        seller = payable(msg.sender);

        startingPrice = _startingPrice;

        discountRate = _discountRate;

        startAt = block.timestamp;

        expiresAt = block.timestamp + DURATION;

  

        require(_startingPrice >= _discountRate * DURATION, "starting price < discount");

  

        nft = IERC721(_nft);

        nftId = _nftId;

    }

  

    function getPrice() public view returns (uint) {

        uint timeElapsed = block.timestamp - startAt;

        uint discount = discountRate * timeElapsed;

        return startingPrice - discount;

    }

  

    function buy() external payable{

        require(block.timestamp < expiresAt, "auction expired");

  

        uint price = getPrice();

        require(msg.value >= price, "ETH < price");

  

        nft.transferFrom(seller, msg.sender, nftId);

        uint refund = msg.value - price;

        // 价格在时刻降低的，所以把多出的退还

        if(refund > 0){

            payable(msg.sender).transfer(refund);

        }

        //铸币发送到出售者手上

        selfdestruct(seller);

    }

}
```
## 英式拍卖
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

interface IERC721 {

    function transferFrom(

        address _from,

        address _to,

        uint256 _nftId

    ) external;

}

  

contract EnglishAuction {
    event Start();
    event Bid(address indexed sender, uint256 amount);
    event Withdraw(address indexed bidder, uint256 amount);
    event End(address highestBidder, uint amount);

    IERC721 public immutable nft;
    uint256 public immutable nftId;

    address payable public immutable seller;
    uint32 public endAt;
    bool public started;
    bool public ended;

    address public highestBidder;
    uint256 public highestBid;
    mapping(address => uint256) public bids;

    constructor(
        address _nft,
        uint256 _nftId,
        uint256 _startingBid

    ) {
        nft = IERC721(_nft);
        seller = payable(msg.sender);
        highestBid = _startingBid;

    }

  

    function start() external {
        require(msg.sender == seller, "not seller");
        require(!started, "started");

        started = true;
        endAt = uint32(block.timestamp + 60);
        nft.transferFrom(seller, address(this), nftId);

        emit Start();

    }

  

    function bid() external payable {
        require(started, "not started");
        require(block.timestamp < endAt, "ended");
        require(msg.value > highestBid, "value < highest bid");

        // 除了零地址，把上一个出价的累加记录，方便退还

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        // 更新最高出价

        highestBid = msg.value;
        highestBidder = msg.sender;

        emit Bid(msg.sender, msg.value);

    }

  

    // 你的出价被新的最高出价给覆盖后，你可以取回；

    function withdraw() external {
        uint256 bal = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(bal);
        emit Withdraw(msg.sender, bal);

    }

  

    function end() external {
      require(started, "not started");
      require(!ended, "ended");
      require(block.timestamp >= endAt, "not ended");
      
      ended = true;
      
      if(highestBidder != address(0)) {
        nft.transferFrom(address(this), highestBidder, nftId);
        seller.transferFrom(address(this), seller, nftId);

      }

      emit End(highestBidder, highestBid);

    }

}
```
## 众筹合约
```JavaScript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IERC20 {
    function transfer(address, uint) external returns (bool);

    function transferFrom(
        address,
        address,
        uint
    ) external returns (bool);
}

contract CrowdFund {
    event Launch(
        uint id,
        address indexed creator,
        uint goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint id, address indexed caller, uint amount);

    struct Campaign {
        // Creator of campaign
        address creator;
        // Amount of tokens to raise
        uint goal;
        // Total amount pledged
        uint pledged;
        // Timestamp of start of campaign
        uint32 startAt;
        // Timestamp of end of campaign
        uint32 endAt;
        // True if goal was reached and creator has claimed the tokens.
        bool claimed;
    }

    IERC20 public immutable token;
    // Total count of campaigns created.
    // It is also used to generate id for new campaigns.
    uint public count;
    // Mapping from id to Campaign
    mapping(uint => Campaign) public campaigns;
    // Mapping from campaign id => pledger => amount pledged
    mapping(uint => mapping(address => uint)) public pledgedAmount;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function launch(
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        count += 1;
        campaigns[count] = Campaign({
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });

        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

    function cancel(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");

        delete campaigns[_id];
        emit Cancel(_id);
    }

    function pledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged += _amount;
        pledgedAmount[_id][msg.sender] += _amount;
        token.transferFrom(msg.sender, address(this), _amount);

        emit Pledge(_id, msg.sender, _amount);
    }

    function unpledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        token.transfer(msg.sender, _amount);

        emit Unpledge(_id, msg.sender, _amount);
    }

    function claim(uint _id) external {
        Campaign storage campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed");

        campaign.claimed = true;
        token.transfer(campaign.creator, campaign.pledged);

        emit Claim(_id);
    }

    function refund(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;
        token.transfer(msg.sender, bal);

        emit Refund(_id, msg.sender, bal);
    }
}

```
## create2 部署合约
特性：新部署的地址在部署之前就可以被预测出来
```JavaScript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Factory {
    // Returns the address of the newly deployed contract
    function deploy(
        address _owner,
        uint _foo,
        bytes32 _salt
    ) public payable returns (address) {
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2
        return address(new TestContract{salt: _salt}(_owner, _foo));
    }
}

// This is the older way of doing it using assembly
contract FactoryAssembly {
    event Deployed(address addr, uint salt);

    // 1. Get bytecode of contract to be deployed
    // NOTE: _owner and _foo are arguments of the TestContract's constructor
    function getBytecode(address _owner, uint _foo) public pure returns (bytes memory) {
        bytes memory bytecode = type(TestContract).creationCode;

        return abi.encodePacked(bytecode, abi.encode(_owner, _foo));
    }

    // 2. Compute the address of the contract to be deployed
    // NOTE: _salt is a random number used to create an address
    function getAddress(bytes memory bytecode, uint _salt)
        public
        view
        returns (address)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), _salt, keccak256(bytecode))
        );

        // NOTE: cast last 20 bytes of hash to address
        return address(uint160(uint(hash)));
    }

    // 3. Deploy the contract
    // NOTE:
    // Check the event log Deployed which contains the address of the deployed TestContract.
    // The address in the log should equal the address computed from above.
    function deploy(bytes memory bytecode, uint _salt) public payable {
        address addr;

        /*
        NOTE: How to call create2

        create2(v, p, n, s)
        create new contract with code at memory p to p + n
        and send v wei
        and return the new address
        where new address = first 20 bytes of keccak256(0xff + address(this) + s + keccak256(mem[p…(p+n)))
              s = big-endian 256-bit value
        */
        assembly {
            addr := create2(
                callvalue(), // wei sent with current call
                // Actual code starts after skipping the first 32 bytes
                add(bytecode, 0x20),
                mload(bytecode), // Load the size of code contained in the first 32 bytes
                _salt // Salt from function arguments
            )

            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        emit Deployed(addr, _salt);
    }
}

contract TestContract {
    address public owner;
    uint public foo;

    constructor(address _owner, uint _foo) payable {
        owner = _owner;
        foo = _foo;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

```
## 多重调用
可以把一个或多个合约的多次函数调用打包整合在一个交易中对合约再进行调用。
这样做的好处就是有时我们需要在同一个前端网站页面中对合约进行几十次调用，而一个链的 RPC 节点又限制了每个客户端对链的调用在 20 秒间隔内只能调用一次，所以我们要把多个合约的调用打包在一起成为一次调用，这样就可以在一次调用中把我们想要的数据都读取出来了。
```JavaScript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract TestMultiCall {
    function test(uint _i) external pure returns (uint) {
        return _i;
    }

    function getData(uint _i) external pure returns (bytes memory) {
        return abi.encodeWithSelector(this.test.selector, _i);
    }
}
```

```JavaScript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract MultiCall {
    function multiCall(address[] calldata targets, bytes[] calldata data)
        external
        view
        returns (bytes[] memory)
    {
        require(targets.length == data.length, "target length != data length");

        bytes[] memory results = new bytes[](data.length);

        for (uint i; i < targets.length; i++) {
        // 静态调用
            (bool success, bytes memory result) = targets[i].staticcall(data[i]);
            require(success, "call failed");
            results[i] = result;
        }

        return results;
    }
}

```
## 多重委托调用
直接调用就是 msg.sender 只能看见上一个合约来调用它，委托不是。
```JavaScript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract MultiDelegatecall {
    error DelegatecallFailed();

    function multiDelegatecall(bytes[] memory data)
        external
        payable
        returns (bytes[] memory results)
    {
        results = new bytes[](data.length);

        for (uint i; i < data.length; i++) {
            (bool ok, bytes memory res) = address(this).delegatecall(data[i]);
            if (!ok) {
                revert DelegatecallFailed();
            }
            results[i] = res;
        }
    }
}

// Why use multi delegatecall? Why not multi call?
// alice -> multi call --- call ---> test (msg.sender = multi call)
// alice -> test --- delegatecall ---> test (msg.sender = alice)
contract TestMultiDelegatecall is MultiDelegatecall {
    event Log(address caller, string func, uint i);

    function func1(uint x, uint y) external {
        // msg.sender = alice
        emit Log(msg.sender, "func1", x + y);
    }

    function func2() external returns (uint) {
        // msg.sender = alice
        emit Log(msg.sender, "func2", 2);
        return 111;
    }

    mapping(address => uint) public balanceOf;

    // WARNING: unsafe code when used in combination with multi-delegatecall
    // user can mint multiple times for the price of msg.value
    function mint() external payable {
        balanceOf[msg.sender] += msg.value;
    }
}

contract Helper {
    function getFunc1Data(uint x, uint y) external pure returns (bytes memory) {
        return abi.encodeWithSelector(TestMultiDelegatecall.func1.selector, x, y);
    }

    function getFunc2Data() external pure returns (bytes memory) {
        return abi.encodeWithSelector(TestMultiDelegatecall.func2.selector);
    }

    function getMintData() external pure returns (bytes memory) {
        return abi.encodeWithSelector(TestMultiDelegatecall.mint.selector);
    }
}

```
## ABI 解码
```JavaScript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract AbiDecode {
    struct MyStruct {
        string name;
        uint[2] nums;
    }

    function encode(
        uint x,
        address addr,
        uint[] calldata arr,
        MyStruct calldata myStruct
    ) external pure returns (bytes memory) {
        return abi.encode(x, addr, arr, myStruct);
    }

	// 解码的时候也必须知道数据的类型
    function decode(bytes calldata data)
        external
        pure
        returns (
            uint x,
            address addr,
            uint[] memory arr,
            MyStruct memory myStruct
        )
    {
        // (uint x, address addr, uint[] memory arr, MyStruct myStruct) = ...
        (x, addr, arr, myStruct) = abi.decode(data, (uint, address, uint[], MyStruct));
    }
}

```
## Gas 优化
- use calldata
- load state variable to memory(每次在循环中累加的是内存变量，并不是写入状态变量，最后写入)
- short circuit(短路)
- loop increments(i+=1 => ++i)
- cache array length(可以把要循环重复计算的值赋给内存变量)
- load array length
- load array elements to memory
## 时间锁合约
如果你要针对合约进行一个重要操作，这个重要操作必须排在队列中等待 48 小时或者其他时间，之后我们就可以看到这样的操作具体内容是什么，如果它是一个作恶操作，或者是一个不好的行为，就可以即时的取消它。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract TimeLock {

    error NotOwnerError();

    error AlreadyQuenedError(bytes32 txId);

    error TimestampNotInRangeError(uint256 blockTimestamp, uint256 timestamp);

    error NotQueuedError(bytes32 txId);

    error TimestampNotPassedError(uint256 blockTimestamp, uint256 timestamp);

    error TimestampExpiredError(uint256 blockTimestamp, uint256 expiresAt);

    error TxFailedError();

    error NotQuenedError(bytes32 txId);

  

    event Quene(

        bytes32 indexed txId,

        address indexed target,

        uint256 value,

        string func,

        bytes data,

        uint256 timestamp

    );

  

    event Execute(

        bytes32 indexed txId,

        address indexed target,

        uint256 value,

        string func,

        bytes data,

        uint256 timestamp

    );

  

    event Cancel(bytes32 txId);

  

    uint256 public constant MIN_DELAY = 10;

    uint256 public constant MAX_DELAY = 1000;

    uint256 public constant GRACE_PERIOD = 1000;

  

    address public owner;

    mapping(bytes32 => bool) public quened;

  

    constructor() {

        owner = msg.sender;

    }

  

    receive() external payable {}

  

    modifier onlyOwner() {

        if (msg.sender != owner) {

            revert NotOwnerError();

        }

        _;

    }

  

    function getTxId(

        address _target,

        uint256 _value,

        string calldata _func,

        bytes calldata _data,

        uint256 _timestamp

    ) public pure returns (bytes32 txId) {

        return keccak256(abi.encode(_target, _value, _func, _data, _timestamp));

    }

  

    function quene(

        address _target,

        uint256 _value,

        string calldata _func,

        bytes calldata _data,

        uint256 _timestamp

    ) external onlyOwner {

        bytes32 txId = getTxId(_target, _value, _func, _data, _timestamp);

        if (quened[txId]) {

            revert AlreadyQuenedError(txId);

        }

  

        if (

            _timestamp < block.timestamp + MIN_DELAY ||

            _timestamp > block.timestamp + MAX_DELAY

        ) {

            revert TimestampNotInRangeError(block.timestamp, _timestamp);

        }

  

        quened[txId] = true;

  

        emit Quene(txId, _target, _value, _func, _data, _timestamp);

    }

  

    function execute(

        address _target,

        uint256 _value,

        string calldata _func,

        bytes calldata _data,

        uint256 _timestamp

    ) external payable onlyOwner returns (bytes memory) {

        bytes32 txId = getTxId(_target, _value, _func, _data, _timestamp);

        if (!quened[txId]) {

            revert NotQueuedError(txId);

        }

        if (block.timestamp < _timestamp) {

            revert TimestampNotPassedError(block.timestamp, _timestamp);

        }

        if (block.timestamp > _timestamp + GRACE_PERIOD) {

            revert TimestampExpiredError(

                block.timestamp,

                _timestamp + GRACE_PERIOD

            );

        }

  

        quened[txId] = false;

  

        bytes memory data;

        if (bytes(_func).length > 0) {

            data = abi.encodePacked(bytes4(keccak256(bytes(_func))), _data);

        } else {

            data = _data;

        }

  

        (bool ok, bytes memory res) = _target.call{value: _value}(data);

        if (!ok) {

            revert TxFailedError();

        }

  

        emit Execute(txId, _target, _value, _func, _data, _timestamp);

  

        return res;

    }

  

    function cancel(bytes32 _txId) external onlyOwner {

      if (!quened[_txId]) {

        revert NotQuenedError(_txId);

      }

      quened[_txId] = false;

      emit Cancel(_txId);

    }

}

  

contract TestTimeLock {

    address public timeLock;

  

    constructor(address _timeLock) {

        timeLock = _timeLock;

    }

  

    function test() external {

        // 该方法确认调用者为时间锁合约

        require(msg.sender == timeLock);

        // more code here

    }

}
```

