# Solidity8 高级

## 合约部署
通过合约部署合约。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract TestContract1 {

    address public owner = msg.sender;

  

    function setOwner(address _owner) public {

        require(msg.sender == owner, "not owner");

        owner = _owner;

    }

}

  

contract TestContract2 {

    address public owner = msg.sender;

    uint public value = msg.value;

    uint public x;

    uint public y;

  

    constructor(uint _x, uint _y) payable {

        x = _x;

        y = _y;

    }

}

  

contract Proxy {

    function deploy(bytes memory _code) external payable {

        new TestContract1();

    }

}
```
但是我们希望直接通过在_code 处输入机器码就可以直接部署合约，接下来实现一个新的代理合约：
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract TestContract1 {

    address public owner = msg.sender;

  

    function setOwner(address _owner) public {

        require(msg.sender == owner, "not owner");

        owner = _owner;

    }

}

  

contract TestContract2 {

    address public owner = msg.sender;

    uint public value = msg.value;

    uint public x;

    uint public y;

  

    constructor(uint _x, uint _y) payable {

        x = _x;

        y = _y;

    }

}

  

contract Proxy {

    event Deploy(address);

  

    function deploy(bytes memory _code) external payable returns (address addr) {

        // 添加内联汇编

        assembly {

            // create(v, p, n)

            // v = amount of ETH to send

            // p = pointer in memory o start of code

            // n = size of code

             addr := create(callvalue(), add(_code, 0x20), mload(_code))  // 隐式返回

            // 这里用 callvalue()替换平常使用的 msg.sender 来获取这次消息发送的主例

            // add(_code, 0x20)获取 pointer，mload(_code)获取大小

        }

        // 返回的地址使零地址，说明这次合约失败

        require(addr != address(0), "deploy failed");

  

        // 之后触发这个事件，这样我们就可以在交易中看到这个地址是多少了

        emit Deploy(addr);

    }

    // 使代理合约将这个地址改为我们的

    function execute(address _target, bytes memory _data) external payable {

        (bool success, ) = _target.call{value: msg.value}(_data);

        require(success, "failed");

    }

}

// 获取机器码_code

contract Helper {

    function getBytecode1() external pure returns (bytes memory) {

        bytes memory bytecode = type(TestContract1).creationCode;

        return bytecode;

    }

    // 测试合约 2 它有构造函数，有参数，所以不能直接像上述操作一样，

    function getBytecode2(uint _x, uint _y) external pure returns (bytes memory) {

        bytes memory bytecode = type(TestContract2).creationCode;

        // 所以我们将 xy 通过打包的形式连接在其之后形成新的 bytecode 这样就能形成新的 bytecode

        return abi.encodePacked(bytecode, abi.encode(_x, _y));

    }

    // 这是设置管理员那个方法的 bytecode

    function getCalldata(address _owner) external pure returns (bytes memory) {

        return abi.encodeWithSignature("setOwner(address)" _owner);

    }

}
```
## 存储位置
- storage：使用该定义修改后，状态变量的值就直接发生了修改
- memory：使用该定义修改后，是处于局部变量的位置，函数调用结束后就消失了，并不会对状态变量产生影响。
- calldata：和 memory 类似，但只能用在输入的参数中，相比于 memroy 参数，calldata 在多函数传递参数时，可以直接传递，不需要像 memory 一样复制，从而可以**节省 gas**。
当参数或返回值是数组、字符串、结构体这类的，都需要加上 memory 关键字
**简单存储例子：**
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

contract SimpleStorage {

    string public text;

  

    // aaaaaaaaaaaaaa...

    // calldata 89626 gas

    // memory 90114 gas

    function set(string calldata _text) external {

        text = _text;  // 修改状态变量

    }

    // 相当于智能合约将状态变量拷贝到了内存中然后返回回来

    function get() external view returns (string memory) {

        return text;

    }

}
```
## 阶段例子--TodoList
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

// insert, update, read  from array of structs

contract TodoList {

    struct Todo {

        string text;

        bool completed;

    }

  

    Todo[] public todos;

  

    function create(string calldata _text) external {

        todos.push(Todo({

            text: _text,

            completed: false

        }));

    }

    // 根据索引进行更新

    function updateText() external {

        // method1: 如果只更新其中一部分内容，这种方法会更节约 gas

        todos[_index].text = _text;

  

        // method2：先装入到 storage 中，再进行更新。这种方法对于更新全部数据会更节约 gas

        Todo storage todo = todos[_index];

        todo.text = _text;

        // other data...

    }

  

    function get(uint _index) external view returns (string memory, bool) {

        Todo memory todo = todos[_index];

        return (todo.text, todo.completed);

    }

  

    function toggleCompleted(uint _index) external {

        // 改变完成状态，反转即可。

        todos[_index].completed = !todos[_index].completed;

    }

}
```

## 事件
事件是一种记录当前智能合约运行状态的方法，但是它并不会记录在状态变量中，而是会体现在区块浏览器上，或是出现在交易记录中的`Log`中。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Event {

    event Log(string message. uint val);

    // 注意：就是在一个事件中，可以让他汇报很多很多变量，但是在索引总，最多只能有三个变量。

    event IndexedLog(address indexed sender, uint val);

  

    function example() external {

        // 调用这个函数就会触发这个事件，这个事件就会记录在交易记录中的 Logs 里，也会体现在区块链浏览器上

        emit Log("Foo", 1234);

        emit IndexedLog(msg.sender, 789);

        // 然后我们在链外用 web3 或者其他就可以查出该地址所有的事件  

    }

    // 索引的三个变量例子

    event Message(address indexed _from, address indexed _to, string message);

    function sendMessage(address _to, string calldata message) external{

        // 然后同上，写个函数触发这个事件

        emit Message(msg.sender, _to, message);

    }

}
```
## 继承
### 基础
- 在继承前，首先要用`virtual`标记哪些函数是可以被重写的
- 然后后面来进行重写操作的函数也要通过`override`标记函数来证明它是覆盖调之前的函数
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract A {

    function foo() public pure virtual returns (string memory) {

        return "A";

    }

  

    function bar() public pure virtual returns (string memory) {

        return "A";

    }

  

    // more code here

    function baz() public pure returns (string memory) {

        return "A";

    }

}

  

contract B is A {

    function foo() public pure override returns (string memory) {

        return "B";

    }

  

    function bar() public pure override returns (string memory) {

        return "B";

    }

  

    // more code here

}
```
### 多重继承：
**原则**：我们需要把继承最少，越基础的合约放在最前面，按层数从上往下来，不然编译的时候就会报错！
```JavaScript
contract X{//...}
contract Y is X{//...}
contract Z is X,Y{
	function foo() public pure override(X, Y) returns (string memory) {//...}
}
```
注意：这里第三行就需要先写 X，再写 Y。
### 运行父合约中构造函数
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract S{

    string public name;

  

    constructor(string memory _name) {

        name = _name;

    }

}

  

contract T {

    string public text;

  

    constructor(string memory _text) {

        text = _text;

    }

}

  

// method1：在已知构造函数所需参数的时候可以使用这种方法

contract U is S("s"), T("t") {

  

}

// method2：这样可以在部署的时候由调用者自己使用

contract V is S, T {

    constructor(string memory _name, string memory _text) S(_name) T(_text) {

  

    }

}

// 混合使用：一个继承的时候传，一个部署的时候传

contract UV is S("s"), T {

    constructor(string memory _text) T(_text) {

  

    }

}
```
构造函数初始化的运行顺序：会按照继承的顺序进行初始化，即使改变了构造函数上的`S(_name) T(_text)`的顺序也不会影响，始终是按继承的顺序进行初始化。
```JavaScript
// Order of execution

// 1. T

// 2. S

// 3. V3

contract V3 is T, S {

    constructor(string memory _name. string memory _text) S(_name) T(_text) {}

} 
```
### 调用父级合约函数
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract E {

    event Log(string message);

    function foo() public virtual {

        emit Log("E.foo");

    }

  

    function bar() public virtual {

        emit Log("E.bar");

    }

}

// 调用父级合约的函数

contract F is E {

    function foo() public virtual override {

        emit Log("F.foo");

        // method1：直接调用

        E.foo();

    }

  

    function bar() public virtual override {

        emit Log("F.bar");

        // method2：使用 super，这个关键字会自动寻找父级合约

        super.bar();  // 如果是多个父级合约都含有该方法，会栈式调用，并且调用且只调用一次所有相关合约

    }

}
```
## 可视范围
- private：合约的内部可见
- internal：合约内部和继承其的子合约
- public：公开
- external：只有外部的合约可见
## 不可变量
有些常量的值在部署合约之前是不知道的。
关键词：`immutable`
也会节约`gas`费
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  
  

contract Immutable {

    // 45718 gas

    // address public owner = msg.sender;

  

    // 43585 gas

    address public immutable owner;

  

    constructor() {

        owner = msg.sender;

    }

  

    uint public x;

    function foo() external {

        require(msg.sender == owner);

        x += 1;

    }

}
```
## 支付 Eth
如果你在函数中标记一个 payable 关键词，你就可以接收以太坊铸币的参数。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Payable {

    // 标记地址变量，然后这个地址就可以发送以太坊铸币了

    address payable public owner;

  

    constructor() {

        owner = payable(msg.sender);  // 这里因为之前定义的 owner 具有 payable 关键字，所以这里也需要加上，否则报错！

    }

  

    function deposit() external payable{}  // 这里可以接收铸币了，别人发的会存在当前合约地址上

  

    function getBalance() external view returns (uint) {

        return address(this).balance;

    }

}
```
## 回退函数
功能：
- 当你调用函数在合约中不存在的时候
- 向合约中直接发送以太坊铸币的时候
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Fallback {

    // 当你调用合约中不存在的函数的时候，就会转入到回退函数中，触发里面的逻辑。

    // 而要接收铸币的发送，还需要加上 payable

    fallback() external payable {}

    // solidity8.0 进行了细化，对铸币的回退单独出了一个函数

    receive() external payable {}  // 有这个函数，发送铸币回退时就只进入该函数，没有这个函数，就会进入 fallback 函数
    // 同时 receive 函数时不接收任何数据的

}
```
## 发送 Eth
- transfer  -- 2300gas，reverts（失败）
- send  -- 2300gas，return bool
- call -- all gas，returns bool and data
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract SendEther {

    constructor() payable {

        function sendViaTransfer(address payable _to) external payable {

            _to.transfer(123);

        }

        // 发送铸币的时候，只带 2300gas，如果 gas 被消耗完，或者是发送的时候对方拒收等其他原因，就会报出异常 revert

        function sendViaSend(address payable _to) external payable {

            _to.transfer(123);  // 123wei+2300gas

        }

        // 遇到错误情况并不会报出异常，而是返回一个布尔值

        function sendViaSend(address payable _to) external payable {

            bool sent = _to.send(123);

            // 确认

            require(sent, "send failed");

        }

  

        function sendViaCall(address payable _to) external payable {

            // 两个返回值，1：是否成功；2：bytes memory data：如果这次调用遇到的是智能合约，它有可能返回一个 data 数据

           (bool success, ) =  _to.call{value: 123}("");

           require(success, "call failed");

        }

    }

}
```
## 阶段例子--钱包合约
通过这个钱包，我们可以向合约中存入一定数量的以太坊铸币，并且可以随时从我们的合约中取出我们的以太坊铸币。
我们还需要规定管理员的身份。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract EtherWallet {

    address payable public owner;

  

    constructor() {

        owner = payable(msg.sender);

    }

  

    receive() external payable {}

  

    // 合约的拥有者可以随时取出里面的铸币，发送当然不需要了，谁都可以发送铸币给该合约。

    function withdraw(uint _amount) external {

        require(msg.sender == owner, "caller is not owner");

        // owner.transfer(_amount);

        // 节约 gas 可以这样写，因为 owner 是从状态变量中读取出来的

        payable(msg.sender).transfer(_amount);

    }

  

    function getBalance() external view returns (uint) {

        return address(this).balance;

    }

}
```
## 调用其他合约
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract CallTestContract {

    // method1

    function setX1(address _test, uint _x) external {

        // 只需要把另一个合约当作类型，然后传入其地址，就可以调用其方法了。

        TestContract(_test).setX(_x);

    }

    // method2

    function setX2(TestContract _test, uint _x) external {

        _test.setX(_x);

    }

    // 更复杂的情况

    function setXandSendEther(address _test, uint _x) external payable {

        TestContract(_test).setXandReceiveEther{value: msg.value}(_x);

    }

}

  

contract TestContract {

    uint public x;

    uint public value = 123;

  

    function setX(uint _x) external {

        x = _x;

    }

  

    function getX() external view returns (uint) {

        return x;

    }

  

    function setXandReceiveEther(uint _x) external payable {

        x = _x;

        value = msg.value;

    }

  

    function getXandValue() external view returns (uint, uint) {

        return (x, value);

    }

}
```
## 接口合约
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

interface ICounter {

    function count() external view returns (uint);

    function inc() external;

}

  

contract CallInterface {

    uint public count;

  

    function examples(address _counter) external {

        ICounter(_counter).inc();

        count = ICounter(_counter).count();

    }

}

// 然后你这里就可以部署了

// 其他地方实现对应的 Counter 合约

// 然后通过地址调用就可以了
```
## 低级 call
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract TestCall {

    string public message;

    uint public x;

  

    event Log(string message);

  

    fallback() external payable {

        emit Log("fallback was called");

    }

  

    function foo(string memory _message, uint _x) external payable returns (bool, uint) {

        message = _message;

        x = _x;

        return (true, 999);

    }

}

// 去调用上面的合约

contract Call {

    bytes public data;

  

    function callFoo(address _test) external payable{

        // 传入的是 abi 编码

        (bool success, bytes memory data)_test.call{value: 111, gas: 5000}(

            abi.encodeWithSignature(

                "foo(string, uint256)", "call foo", 123

            )

        );

        require(success, "call failed");

        data = _data;

    }

  

    function callDoesNotExit(address _test) external {

        (bool success, ) = _test.call(abi.encodeWithSignature("doesNotExist()"));

        require(success, "call failed");

    }

}
```
## 委托调用
![](https://oss.justin3go.com/blogs/Pasted%20image%2020220618092903.png)
C 是委托调用的 B，所以值和铸币都是保存在 B 的，C 可以看到但不可以修改，同时看到的也是 A 的。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract TestDelegateCall {

    uint public num;

    address public sender;

    uint public value;

  

    function setVars(uint _num) external payable {

        num = _num;

        sender = msg.sender;

        value = msg.value;

    }

}

  

contract DelegateCall {

    uint public num;

    address public sender;

    uint public value;

  

    function setVars(address _test, uint _num) external payable {

        // 这里进行委托调用

        // _test.delegatecall(

        //     abi.encodeWithSignature("setVars(uint56)", _num)

        // );

        // 上述写法是使用签名进行编码

        // 另一种写法，这里使用 Select 进行编码

        (bool success, bytes memory data) = _test.delegatecall(

            abi.encodeWithSelect(TestDelegateCall.setVars.selector, _num);

        );

        require(success, "delegatecall failed");

    }

}
```
- 就是可以让我们得调用委托到下一个合约中，底层相当于把被调用合约代码拿到调用合约中使用，类似调用库合约。
- 被调用的合约的值不能被改变，我们只是使用被调用合约的逻辑来改变当前合约的状态变量的值
- 虽然不用被调用合约的状态变量值，但必须要设置，因为要使他们的变量结构是一样的。
## 工厂合约
用合约部署合约（之前讲过一种通过内联汇编部署新合约的方法）
通过 new 语句新建合约的方法
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Account {

    address public bank;

    address public owner;

  

    constructor(address _owner) payable {

        bank = msg.sender;

        owner = _owner;

    }

}

  

contract AccountFactory {

    Account[] public accounts;  // 用一个数组去记录所有创建过的账户合约

  

    function createAccount(address _owner) external payable{

        // 返回的是账户合约的地址，可以用账户合约类型去接收它。

        Account account = new Account{value: 111}(_owner);  // 创建的时候也是可以接收铸币的，这里同样可以使用大括号进行接收

        accounts.push(account);

    }

}
```
## 库合约
我们可以把常用的算法抽象成为库合约。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

library Math {

    // 这里得定义为内部可视，因为库合约一般都是在合约内部使用的，定义为外部可视是没有任何意义的

    function max(uint x, uint y) internal pure returns (uint) {

        return x >= y ? x : y;

    }

}

  

contract Test {

    function testMax(uint x, uint y) external pure returns (uint) {

        return Math.max(x, y);

    }

}

  

library ArrayLib {

    function find(uint[] storage arr, uint x) internal view returns (uint) {

        for (uint i = 0; i < arr.length; i++) {

            if(arr[i] == x) {

                return i;

            }

        }

        revert("not found");

    }

}

  

contract TestArray {

    using ArrayLib for uint[]; // 使这个类型具有这个库的所有方法；

    uint[] public arr = [3,2,1];

  

    function testFind() external view returns (uint i) {

        // return ArrayLib.find(arr, 2);

        return arr.find(2);

    }

}
```
## 哈希运算
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract HashFunc {

    function hash(string memory text, uint num, address addr) external pure returns (bytes32) {

        // 哈希算法的一种特定内部函数,传入这三个参数前先进行打包,打包之后会形成一个 bytes 的返回值，这个返回值是不定长的，然后再通过哈希

        return keccak256(abi.encodePacked(text, num, addr));

  

        // 测试 encode 与 encodePacked 的区别

        function encode(string memory text0, string memory text1) external pure returns (memory bytes){  // 这里不定长的需要加上 memory

            return abi.encode(text0. text1);

        }

  

        function encodePacked(string memory text0, string memory text1) external pure returns (memory bytes){

            return abi.encodePacked(text0, text1);

        }

    }

}
```

- encode：进行了补零
- encodePacked：直接返回得 16 进制
![](https://oss.justin3go.com/blogs/Pasted%20image%2020220619145319.png)

不进行补零会容易出现一些错误，比如("AAAA","BBB")和("AAA","ABBB")的 encodePacked 返回值是没有任何变化的。这样就有可能造成哈希错误(碰撞)
**所以以后在需要哈希的时候尽量使用 encode 进行打包**
## 验证签名
1. 消息签名
2. 消息进行哈希
3. 再把私钥和哈希后的消息进行签名，在链下完成
4. 恢复签名
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract VerifySig {

    // 最后我们要验证恢复后的地址和签名人的地址是否是相等的

    function vertify(address _signer, string memory _message, bytes memory _sig)

        external pure returns (bool)

    {

        bytes32 messageHash = getMessageHash(_message);  // 1.

        bytes32 ethSignedMessageHash = getEthSinedMessageHash(messageHash);  // 2.

        // 3.4.

        return recover(ethSignedMessageHash, _sig) == _signer;

    }

    function getMessageHash(string memory _message) public pure returns (bytes32) {

        return keccak256(abi.encodePacked(_message));

    }

  

    function getEthSinedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {

        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));

    }

  

    function recover(bytes32 _ethSignedMessageHash, bytes memory _sig)

        public pure returns (address)

    {

        (bytes32 r, bytes32 s, uint8 v) = _split(_sig);

        return ecrecover(_ethSignedMessageHash, v, r, s);

    }

  

    function _split(bytes memory _sig) internal pure returns (bytes32 r, bytes32 s, uint8 v){

        require(_sig.length == 65, "invalid signature length");

  

        assembly {

            r := mload(add(_sig, 32))

            s := mload(add(_sig, 64))

            v := byte(0, mload(add(_sig, 96)))

        }

    }

}
```
## 阶段例子--权限控制合约
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract AccessControl {

    event GrantRole(bytes32 indexed role, address indexed account);

    event RevokeRole(bytes32 indexed role, address indexed account);

  

    // role => account => bool

    mapping(bytes32 => mapping(address => bool)) public roles;

    // 我们采用哈希值做名称是因为 string 比 bytes32 消耗的 gas 要多得多

    bytes32 private constant ADMIN = keccak256(abi.encodePacked("ADMIN"));

    bytes32 private constant USER = keccak256(abi.encodePacked("USER"));

  

    modifier onlyRole(bytes32 _role) {

        require(roles[_role][msg.sender]. "not authorized");

        _;

    }

  

    // 初始时，将管理员权限赋给合约的部署者

    constructor() {

        _grantRole(ADMIN, msg.sender);

    }

  

    // 升级角色的函数，内部的不做权限检查

    function _grantRole(bytes32 _role, address _account) internal {

        roles[_role][_account] = true;  // 这里我们修改了状态变量的值，按照智能合约的编写习惯来说，我们修改值后就一定要报出一个事件

        emit GrantRole(_role, _account);

    }

    // 外部的只能由管理员才能调用，所以这里设计并加上函数修改器

    function grantrole(bytes32 _role, address _account) external onlyRole(ADMIN) {

        _grantRole(_role, _account);

    }

    // 撤销权限的函数

    // ... -->false

}
```
## 合约自毁
`selfdestruct`删除合约，强制发送铸币到一个地址。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Kill {

    constructor() payable {}

    function kill() external {

        // 强制删除，就算对方合约拒绝接受，也会收到

        selfdesctruct(payable(msg.sender));

    }

  

    function testCall() external pure returns (uint) {

        return 123;

    }

}
```
## 阶段例子--小猪存钱罐
可以通过任何人地址发送以太坊铸币，存钱罐的拥有者才可以取出，取出之后，它就会像真正的小猪存钱罐一样，会被打碎，就是自毁掉。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract PiggyBank {

    event Deposit(uint amount);

    event Withdraw(uint amount);

  

    address public owner = msg.sender;

  

    receive() external payable {

        emit Deposit(msg.value);

    }

  

    function withdraw() external {

        require(msg.sender == owner, "not owner");

        emit Withdraw(address(this).balance);

        selfdesctruct(payable(msg.sender));

    }

}
```

