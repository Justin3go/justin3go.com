# Solidity8 基本语法

## HelloWorld
```JavaScript
// SPDX-License-Identifier:MIT

// 版权声明

pragma solidity 0.8.7;

// ^代表该版本之上与该版本之内

contract HelloWorld {

    // public 的变量会自带一个 getter 方法

    string public myString = "hello world";

}
```
## 常用类型
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract ValueTypes {

    bool public b = true;

    uint public u = 123;

    // uint = uint256 0-->2**256-1

    //        uint8   0-->2**8-1

    //        uint16  0-->2**16-1

    // 表示负数

    int public i = -123;

    // int = int256   -2**255-->2**255-1

    //       int127   -2**127-->2**127-1

    int public minInt = type(int).min;

    int public maxInt = type(int).max;

    // 最特殊的类型-->代表地址

    address public addr = 0xF9F4eD85E440BfD7A8bADE33454C32dB9E66b283;

    // 比 16 位的地址长一些

    bytes32 public b32 = 0x89c58ced8a9078bdef2bb60f22e58eeff7dbfed6c2dff3e7c508b629295926fa;

}
```
## 函数
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract FunctionIntro {

    // external 代表外部函数，只能在外部读取的函数

    // pure 代表纯函数的概念，意思是这个函数不能够读，也不能够写状态变量，只能够拥有自己的局部变量

    // returns 规定一下返回的类型

    function add(uint x, uint y) external pure returns (uint) {

        return x+y;

    }

    function sub(uint x, uint y) external pure returns (uint) {

        return x-y;

    }

}
```
## 状态变量
状态变量是保存在链上的。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract StateVariables {

    uint public myUint = 123;

    function foo() external {

        uint notStateVariable = 456;

        // 这个变量只有在调用的时候才会在虚拟机的内存中产生

    }

}
```
- 状态变量改变了之后依然会保存在链上
- 而局部变量改变了之后同样也不会保存在链上
## 全局变量
全局变量指的是不用定义就能够使用的变量，这些变量往往记录了链上的信息和账户的信息。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract GlobalVariables {

    // view 和 pure 类似都是只读方法，但是 view 可以读取变量的值；

    function globalVars() external view returns (address, uint, uint) {

        // 展示的账户的内容，指的是调用这个函数的地址是什么（有可能是一个人，也有可能是另一个合约）

        address sender = msg.sender;

        uint timestamp = block.timestamp;  // 指当前区块链的时间戳

        uint blockNum = block.number;  // 区块编号

        return (sender, timestamp, blockNum);

    }

}
```
## 变量的默认值
状态变量和局部变量在你没有给他赋值的情况下都是以默认值存在。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract DefaultValues {

    bool public b;  // false

    uint public u;  // 0

    int public i;   // 0

    address public a; // 0x 很多 0

    bytes32 public b32; //0x 很多 0

}
```
## 常量
如果不变的值，那么就尽量定义为常量，因为它可以节省你的 gas 费。
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Constants {

    // 加上 constant 关键字，同时习惯于变量名为大写

    address public constant MY_ADDRESS = 0xF9F4eD85E440BfD7A8bADE33454C32dB9E66b283;

    uint public constant MY_UINT = 123;

}
```
## ifElse
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract ifElse {

    function example(uint _x) external pure returns (uint) {

        if(_x < 10){

            return 1;

        }else if(_x < 20){

            return 2;

        }else {

            return 3;

        }

    }

  

    function ternary(uint _x) external pure returns (uint) {

        return _x < 10 ? 1 : 2;

    }

}
```
## 循环
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Loop {

    function loops() external pure {

        for (uint i = 0; i < 10 ; i++){

            // continue

            // break

        }

        while(true){

            // ode

        }

    }

}
```
## 报错控制
- require
- revert
- assert
这三种方法都具有 gas 费的退还，和状态变量回滚的特性
8.0 之后还可以自定义错误
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Errors {

    function testRequire(uint _i) public pure {

        require(_i <= 10, "i > 10");  // 只有满足这个条件才可以继续运行，如果不为真，则会报出后面的报错信息

    }

    function testRevert(uint _i) public pure {

        // revert 是不能够包含表达式的

        if(_i > 10){

            revert("i > 10")

        }

    }

    uint public num = 123;

  

    function testAssert() public view {

        assert(num == 123);  // 不含报错信息，只能进行断言判断的作用

    }

    // 自定义错误，可以节约 gas 费

    error MyError(address caller, uint i);

  

    function testCustomError(uint _i) public view {

        if(_i > 10) {

            revert MyError(msg.sender, _i);

        }

    }

}
```
## 函数修改器
能够使复用的代码简化的语法
- Basic
- inputs
- sandwich

```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract FunctionModifier {

    bool public paused;

    uint public count;

  

    function setPause(bool _paused) external {

        paused = _paused;

    }

  

    function inc() external {

        require(!paused, "paused");  // 1

        count += 1;

    }

    function dec() external {

        require(!paused, "paused");  // 2 这两处可以复用

        count -= 1;

    }

}
```
修改之后：
### 基本使用
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract FunctionModifier {

    bool public paused;

    uint public count;

  

    function setPause(bool _paused) external {

        paused = _paused;

    }

    modifier whenNotPaused() {

        require(!paused, "paused");

        _;  // 这个下划线代表其他不同的代码所在的位置

    }

  

    function inc() external whenNotPaused{  // 然后这里再添加上函数名就可以了

        count += 1;

    }

    function dec() external whenNotPaused{

        count -= 1;

    }

}
```
### 带参数的修改器
```JavaScript
    modifier cap(uint _x){

        require(_x < 100, "x >= 100");

        _;

    }

    function incBy(uint _x) external whenNotPaused cap(_x) {

        count += _x;

    }
```
### Sandwich
```JavaScript
    modifier sandwih() {

        // code here

        count += 10;

        _;

        // more code here

        count *= 2;

    }
```
## 构造函数
仅能在合约被部署的时候调用一次
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Constructor {

    address public owner;

    uint public x;

  

    constructor(uint _x) {

        owner = msg.sender;

        x = _x;

    }

}
```
## 例子--Ownable 合约
设计一个有管理员权限的智能合约；
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Ownable {

    address public owner;  // 管理员账户地址；

  

    constructor(){

        owner = mg.sender;  // 将合约的部署者传进去

    }

  

    modifier onlyOwner(){

        require(msg.sender == owner, "not owner");  

        // 函数的调用者只有等于之前记录的 owner 才可以继续调用；

        _;

    }

    // 当前 Owner 才可以操作

    function setOwner(address _newOwner) external onlyOwner {

        // 不能传给零地址，不然就锁死了

        require(_newOwner != address(0), "invaild address")

        owner = _newOwner;

    }

  

    function onlyOwnerCanCallThisFunc() external onlyOwner{

        // some code

    }

    function anyOneCanCall() external {

        // code

    }

  

}
```
## 函数返回值
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract FunctionOutputs {

    function returnMany() public pure returns (uint, bool) {

        return (1, true);

    }

    function named() public pure returns (uint x, bool b) {

        return (1, true);

    }

  

    function assigned() public pure returns (uint x, bool b) {

        // 这里可以隐式返回

        x = 1;

        b = true;

    }

    // 获取函数调用的返回值

    function destructingAssignments() public pure {

        (uint x, bool b) = returnMany();

        // (, bool b) = returnMany();

    }

}
```
## 数组
- 动态数组和固定长度的数组
- 数组的初始化
- 数组的操作
- 在内存中创建数组
- 通过函数来返回数组
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Array {

    uint[] public nums = [1,2,3];  // 动长数组

    uint[3] public numsFixed = [4,5,6];  // 固定数组

  

    function examples() external {

        nums.push(4);  // [1,2,3,4]

        uint x = nums[1];

        nums[1] = 777;  // [1,2,777,4]

        delete nums[1]; // [1,0,777,4] delete 不能减少数组的长度

        nums.pop(); //[1,0,777]

        uint len = nums.length;

  

        // 在内存中创建数组

        uint[] memory a = new uint[](5);  // 在内存中你是不能创建动态数组的，所以这里还要定义一下它的长度

        // 这里不能使用 pop,push 等修改数组长度的方法，只能通过索引操作

        // 总结：在内存中局部变量只能够定义定长数组，而动态数组只能够存在于状态变量中

        a[0] = 123;

    }

    // 返回

    function returnArray() external view returns (uint[] memory){

        return nums;

    }

}
```

**通过移动位置达到真正地删除数组元素的效果。**
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract ArrayShift {

    uint[] public arr;

  

    function example() public {

        arr = [1,2,3];

        delete arr[1]; // [1,0,3]

    }

  

    // [1,2,3] -- remove(1) --> [1,3,3]  --> [1,3];

    function remove(uint _index) public {

        require(_index < arr.length, "index out of bound");

  

        for(uint i = _index; i < arr.length-1; i++){

            arr[i] = arr[i+1];

        }

        arr.pop();

    }

}
```
上述方法是比较消耗 gas 的，因为数组要向左移动，是一个循环；
**通过替换位置达到真正地删除数组元素的效果。**
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

// 就是将最后一个元素覆盖对应要删除的元素的位置，这样可以减少操作，但是没有保证数组的顺序；

contract ArrayReplaceLast {

    uint[] public arr;

  

    // [1,2,3,4] -- remove(1) --> [1,4,3]

    function remove(uint _index) public {

        arr[_index] = arr[arr.length - 1];

        arr.pop();

    }

}
```
## 映射
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Mapping {

    mapping(address => uint) public balances;

    // 嵌套

    mapping(address => mapping(address => bool)) public isFriend;

  

    function examples() external {

        balances[msg.sender] = 123;

        uint bal = balances[msg.sender];

        uint bal2 = balances[address(1)];  // 没有的返回默认值，uint 的默认值为 0

  

        balances[msg.sender] += 456;  //123+456=579;

  

        delete balances[msg.sender];  // 0

  

        isFriend[msg.sender][address(this)] = true;

    }

}
```
映射迭代
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract IterableMapping {

    mapping(address => uint) public balances;  // 地址==>y 余额

    mapping(address => bool) public inserted;  // 某一个地址是否存在于映射中

    address[] public keys;  // 记录所有存在的地址

  

    function set(address _key, uint _val) external {

        balances[_key] = _val;

  

        if(!inserted[_key]) {

            inserted[_key] = true;

            keys.push(_key);

        }

    }

  

    function getSize() external view returns (uint) {

        return keys.length;

    }

    function first() external view returns (uint) {

        return balances[keys[0]];

    }

    function last() external view returns (uint) {

        return balances[keys[keys.length-1]];

    }

    function get(uint _i) external view returns (uint) {

        return balances[keys[_i]];

    }

}
```
## 结构体
```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Structs {

    struct Car {

        string model;

        uint year;

        address owner;

    }

  

    Car public car;

    Car[] public cars;

    mapping(address => Car[]) public carsByOwner;

  

    function examples() external {

        Car memory toyota = Car("Toyota", 1990, msg.sender);

        Car memory lambo = Car({year: 1980, model: "Lamborghini", owner: msg.sender});

        Car memory tesla;  // 这个会使用各个数据类型的默认值

        // 赋值

        tesla.model = "Tesla";

        tesla.year = 2010;

        tesla.owner = msg.sender;

  

        cars.push(toyota);

        cars.push(lambo);

        cars.push(tesla);

        // 推入到数组中，它就从内存中的局部变量值变成了状态变量了

        cars.push(Car("Ferrri", 2020, msg.sender));

  

        // 获取结构体的值

        Car memory _car = cars[0];

        // _car.model;

        // 而如果我们定义在存储中，那么我们就可以修改结构体中的值了

        Car storage _car = cars[0];

        _car.year = 1999;  // 这 hi 后，合约中的状态变量也随之被修改了

  

        // 删除

        delete _car.owner;  // 恢复到默认值

        delete cars[1];

    }

}
```
## 枚举
使一个变量具有多个状态

```JavaScript
// SPDX-License-Identifier:MIT

  

pragma solidity 0.8.7;

  

contract Enum {

    enum Status {

        None,

        Pending,

        Shipped,

        Completed,

        Rejected,

        Ccanceled,

    }

  

    Status public status;

  

    struct Order {

        address buyer;

        Status status;

    }

  

    Order[] public orders;

  

    // 操作

    function get() view returns (Status) {

        return status;

    }

    function set(Status _status) external {

        status = _status;

    }

  

    function ship() external {

        status = Status.Shipped;

    }

  

    function reset() external {

        delete status;

    }

  
  

}
```
