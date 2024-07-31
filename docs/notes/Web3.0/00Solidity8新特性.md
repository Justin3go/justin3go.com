# Solidity8 新特性

## 新特性
- 安全数学
- 自定义错误
- 函数在合约之外
- 引用合约的名称可以起别名
- create2
## safe math
之前的`uint`无符号正整数是有数学溢出的，我们在使用数学方法的时候一般都要引用一个安全数学方法，如果是`0-1`得到的是`uint256`的最大值而不是`-1`，因为`uint`是无符号整数。这种情况就叫做数学溢出的错误。
```JavaScript
// SPDX-License-Identifier:MIT

pragma solidity ^0.8;

  

// safe math

contract SafeMath {

    function testUnderflow() public pure returns (uint) {

        uint x = 0;

        x--;   // 会自动检测安全溢出：call to SafeMath.testUnderflow errored: execution reverted

        return x;

    }

    function testUncheckedUnderflow() public pure returns (uint) {

        uint x = 0;

        unchecked { x--; }  // 不检验安全溢出

        return x;

    }

}
```
## Custom error
```JavaScript
// SPDX-License-Identifier:MIT

pragma solidity ^0.8;

  

// custom error

contract VendingMachine {

    address payable owner = payable(msg.sender);

  

    function withdraw() public {

        if(msg.sender != owner){

            revert("error");  // 以前我们是通过 revert(str)的方式进行报错

            // 其中字符串的长度决定你消耗的 gas 多少

        }

  

        owner.transfer(address(this).balance);

    }

}
```
## 函数在合约之外的使用
```JavaScript
// SPDX-License-Identifier:MIT

pragma solidity ^0.8;

  

// function outside contract

  

function helper(uint x) view returns (uint) {

    return x*2;

}  

// 这种函数里只能进行简单的状态运算，不能含有状态变量

// 该文件，或者继承该文件的地方都可以使用该函数

  

contract TestHelper {

    function test() external view returns (uint) {

        return helper(123);

    }

}
```
## as name
```JavaScript
import {symbol1 as alias, symbol2} from "filename";
```
## create2
原来我们使用`create2`是使用内联汇编的形式：
![](https://oss.justin3go.com/blogs/Pasted%20image%2020220615201958.png)
以前需部署的时候才能知道这个地址，而现在可以使用这个盐(salt)

