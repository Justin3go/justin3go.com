# 剑指 Offer

## 链表
```javascript
function ListNode(x){
    this.val = x;
    this.next = null;
}
```

### JZ6 从尾到头打印链表
```javascript
function printListFromTailToHead(head){
  let res = []
  while(head){
    res.unshift(head.val);
    head = head.next;
  }
  return res;
}
```

### JZ24 反转链表
主要思路就是遍历链表，取每一个节点，然后使用头插法的方式插入另外一条链，时间复杂度未为`O(n)`需要额外的空间：
1. 先用`next`保存下一个节点的位置，因为会操作`curr`指针
2. 使用头插法(因为需要逆序)插入到头为`prev`指针的链上
3. 移动`curr`指针
```javascript
function ReverseList(pHead){
  let prev = null;
  let curr = head;
  while (curr) {
      const next = curr.next;  // 记住除当前节点的后续链
      // 相当于头插
      curr.next = prev;  // 将当前节点连接到新链上
      prev = curr;  // 移动指针到新链的最前面

      curr = next;  // 当前节点换为记住的那个
  }
  return prev;
}
```

### JZ25 合并两个排序的链表
主要思路就是依次遍历两条链，取最小的节点通过尾插法添加到新链，被取中的链移动一个节点，最后注意边缘情况可能有剩余节点；
```javascript
function Merge(pHead1, pHead2){
  let head = new ListNode(-1);
  let p = head;  // 辅助指针
  while(pHead1 && pHead2){
    if(pHead1.val <= pHead2.val){
      p.next = pHead1;
      p = p.next;
      pHead1 = pHead1.next;
    }else{
      p.next = pHead2;
      p = p.next;
      pHead2 = pHead2.next;
    }
  }
  if(pHead1){
    p.next = pHead1;
  }
  if(pHead2){
    p.next = pHead2;
  }

  return head.next;
}
```

### JZ52 两个链表的第一个公共结点
该题主要是这个链表既不是有序的，也没有其他额外信息，应该只能将其中一条链转换为`Set`然后遍历另外一条链进行判断；
```javascript
function FindFirstCommonNode(pHead1, pHead2){
  const mySet = new Set();
  while(pHead1){
    mySet.add(pHead1);
    pHead1 = pHead1.next;
  };
  while(pHead2){
    if(mySet.has(pHead2)){
      return pHead2;
    }else{
      pHead2 = pHead2.next;
    }
  }
  return null;
}
```

### JZ23 链表中环的入口结点
以前的思路是通过`set`来保存是否经过；
```javascript
function EntryNodeOfLoop(pHead){
  const mySet = new Set();
  while(pHead){
    if(mySet.has(pHead)){
      return pHead;
    }else{
      mySet.add(pHead);
    }
    pHead = pHead.next;
  }
  return null;
}
```
还有一种思路是直接在链表的数据结构中添加标志位来判断是否经历过，有点像垃圾回收中的标记清除，遍历过就加个标记；
```javascript
/*function ListNode(x){
    this.val = x;
    this.next = null;
}*/
function EntryNodeOfLoop(pHead) {
  while (pHead !== null) {
    if (pHead.flag) {
      return pHead
    } else {
      pHead.flag = true;
      pHead = pHead.next
    }
  }
  return null
}
```

### JZ22 链表中倒数最后 k 个结点
使用等距双指针即可
```javascript
function FindKthToTail( pHead ,  k ) {
  let right = pHead, left = pHead;
  for(let i = 0; i < k; i++){
    if(!right){  // 链表长度小于 k 的这种情况
      return null;
    }
    right = right.next;
  }
  while(right){
    left = left.next;
    right = right.next;
  }
  return left;
}
```

### JZ35 复杂链表的复制
- 一种方法是遍历链表的时候复制除 random 指针以外的结构
- 同时使用 map 将 random 存储
- 最后遍历 map 修改第一步复制的链
---
- 另外一种方法是在每一个节点后复制新节点
- 然后新节点的 random = 旧节点的 random.next
- 最后奇数个节点是老链，偶数个节点是新链，断开即可

这里实现第二种方法
```javascript
function RandomListNode(x) {
  this.label = x;
  this.next = null;
  this.random = null;
}

function Clone(pHead) {
  let pos = pHead;
  // 每一个节点后复制
  while (pos) {
    let node = new RandomListNode(pos.label);
    node.next = pos.next;
    pos.next = node;
    pos = pos.next.next;
  }
  // 复制 random 节点
  pos = pHead;
  while (pos) {
    if (pos.random) {
      pos.next.random = pos.random.next;
    }
    pos = pos.next.next;
  }
  // 断开
  pos = pHead;
  let cHead = pos?pos.next:null,  // pHead 有可能为空
    cPos = cHead;
  while (pos) {
    pos.next = cPos.next;
    cPos.next = pos.next?pos.next.next:null;
    pos = pos.next;
    cPos = cPos.next;
  }
  return cHead;
}
```

### JZ76 删除链表中重复的结点
- 因为要删除，所以必须有一个指针是在待删除部分的前一个节点
```javascript
function ListNode(x) {
  this.val = x;
  this.next = null;
}
function deleteDuplication(pHead) {
  // 新增头节点，解决边缘：第一个节点就有重复的，用下面的代码也能判断
  let myHead = new ListNode(-1);
  myHead.next = pHead;

  let pos = myHead;
  let next = null;  // 用于判断下一个节点是否有重复值，从而删除节点
  while(pos.next){  // 当前节点为最后一个节点就可以停了
    next = pos.next;
    let nextVal = next.val;
    let flag = 1;
    while(next.next){  // 将 next 移动到接下来第一个不重复的节点上
      if(nextVal !== next.next.val){
        break
      }else{
        next = next.next;
        flag = 0  // 说明有重复的
      }
    }
    if(flag){
      pos = pos.next;
    }else{  // 有重复
      pos.next = next.next;  // 断开重复部分但不移动指针
    }
  }
  return myHead.next;
}
```

### JZ18 删除链表的节点
```javascript
function ListNode(x) {
  this.val = x;
  this.next = null;
}

/**
 * @param head ListNode 类 
 * @param val int 整型 
 * @return ListNode 类
 */
function deleteNode(head, val) {
  let myHead = new ListNode(-1);
  myHead.next = head;
  let prev = myHead;
  let cur = head;
  while(cur){
    if(cur.val === val){
      prev.next = cur.next;
      return myHead.next;
    }else{
      cur = cur.next;
      prev = prev.next;
    }
  }
  return myHead.next;
}
```

## 队列&栈

### JZ9 用两个栈实现队列
主要思路就是一个栈用来存数据，一个栈用来取数据，取数据的栈的数据从存数据的栈中压入，这样取数据的栈就相当于经过了两次顺序转化，负负得正就是队列的顺序了；
```javascript
// 仅用栈的方法实现队列的先进先出
// initial
let arr1 = [], arr2 = [];
function push(node) {
  arr1.push(node);
}
function pop() {
  if(arr2.length){
    return arr2.pop();
  }else{
    while(arr1.length){
      arr2.push(arr1.pop())
    }
    return arr2.pop();
  }
}
```

```javascript
{
  push(1)
  push(2)
  console.log(pop());
  console.log(pop());
}
```

    1
    2


### JZ30 包含 min 函数的栈
新建一个`minStack`来保存最小值，为了和原始栈数量同步，当新加入元素大于`minStack.top`时，就复制`minStack`的顶部元素再压栈；
```javascript
// https://uploadfiles.nowcoder.com/images/20200419/284295_1587290406796_0EDB8C9599BA026855B6DCCC1D5EDAE5
// 主要需考虑弹出的值可能是当前的最小值，弹出之后就可能要变化最小值，这里使用空间换时间
let arr = [];
let minStack = [];
function push(node) {
  arr.push(node);
  if(!minStack.length){
    minStack.push(node);
  }else if(node < minStack[minStack.length-1]){
    minStack.push(node);
  }else{
    minStack.push(minStack[minStack.length-1])
  }
}
function pop() {
  arr.pop();
  minStack.pop();
}
function top() {
  return arr[arr.length-1];
}
function min() {
  return minStack[minStack.length-1];
}
```

```javascript
{
  push(-1);
  console.log(arr, minStack);
  push(2);
  console.log(arr, minStack);
  console.log(min());
  console.log(arr, minStack);
  console.log(top());
  console.log(arr, minStack);
  pop();
  console.log(arr, minStack);
  push(1);
  console.log(arr, minStack);
  console.log(top());
  console.log(arr, minStack);
  console.log(min());
  console.log(arr, minStack);
}
```

    [ -1 ] [ -1 ]
    [ -1, 2 ] [ -1, -1 ]
    -1
    [ -1, 2 ] [ -1, -1 ]
    2
    [ -1, 2 ] [ -1, -1 ]
    [ -1 ] [ -1 ]
    [ -1, 1 ] [ -1, -1 ]
    1
    [ -1, 1 ] [ -1, -1 ]
    -1
    [ -1, 1 ] [ -1, -1 ]


### JZ31 栈的压入、弹出序列

模拟堆栈操作：将原数列依次压栈，栈顶元素与所给出栈队列相比，如果相同则出栈，

如果不同则继续压栈，直到原数列中所有数字压栈完毕。

检测栈中是否为空，若空，说明出栈队列可由原数列进行栈操作得到。否则，说明出栈队列不能由原数列进行栈操作得到。
```javascript
function IsPopOrder(pushV, popV) {
  let arr = [];
  let n = pushV.length  // 题目中已说两数组长度一致
  let j = 0;
  for (let i = 0; i < n; i++) {
    arr.push(pushV[i])
    while (arr.length && arr[arr.length - 1] === popV[j]) {
      arr.pop();
      j++;
    }
  }
  return arr.length ? false : true  // !arr.length
}
```
### JZ73 翻转单词序列
注意这里如果要原地操作的话就是使用双指针加一个变量进行交换；
```javascript
function ReverseSentence(str) {
  return str.split(' ').reverse().join(' ')
}
```

```javascript
'nowcoder. a am I'.split(' ').reverse().join(' ')
```
    'I am a nowcoder.'

### JZ59 滑动窗口的最大值
方法一中存在很多大量重复计算，比如说，对于数组，假设我们当前遍历到下标 i，对于下标 i+1 的元素（假设 i 和 i+1 都在同一个窗口），如果比 arr[i]大，说明了什么？
**如果 arr[i+1] 已经大于了 arr[i], 那么还要 arr[i]有什么用.就有点“既生瑜何生亮”的感觉。**
如果 arr[i+1] < arr[i]呢？显然 arr[i]还是需要保留的。为什么呢？
因为又可以 arr[i] 对于下一个 arr[i+1]所在的窗口来说，arr[i]已经失效了。

假设这里有那么一个容器可以保留上述操作，这个容器存储的是下标，这样方便进行第五步。

- 遍历数组的每一个元素，
- 如果容器为空，则直接将当前元素加入到容器中。
- 如果容器不为空，则让当前元素和容器的最后一个元素比较，**如果大于，则将容器的最后一个元素删除**，然后继续讲当前元素和容器的最后一个元素比较
- 如果当前元素小于容器的最后一个元素，则直接将当前元素加入到容器的末尾
- 如果容器头部的元素已经不属于当前窗口的边界，则应该将头部元素删除
*需要注意的就是上面的第三步，如果大于就删除，这样会保持容器中的顺序*
```javascript
function maxInWindows(num, size) {
  if(!size || !num.length || num.length < size)return [];
  const maxArr = [];
  const res = [];
  // 先把窗口大小的值初始化了
  for (let i = 0; i < size; i++) {
    if (!maxArr.length) {
      maxArr.push(i);
    } else {
      while (maxArr.length && num[i] > num[maxArr[maxArr.length - 1]]) {
        maxArr.pop();
      }
      maxArr.push(i)
    }
  }
  // 开始滑动
  res.push(num[maxArr[0]])
  for (let i = 1, j = i + size - 1; j < num.length; i++, j++) {
    // 类上
    if (!maxArr.length) {
      maxArr.push(j);
    } else {
      while (maxArr.length && num[j] > num[maxArr[maxArr.length - 1]]) {
        maxArr.pop();
      }
      maxArr.push(j)
    }
    // 判断队列的头部的下标是否过期
    if (maxArr[0] < i){
      maxArr.shift();
    }
    res.push(num[maxArr[0]]);
  }
  return res;
}
```

## 树
```javascript
function TreeNode(x) {
    this.val = x;
    this.left = null;
    this.right = null;
}
```

### JZ55 二叉树的深度
```javascript
function TreeDepth(pRoot){
  if(!pRoot)return 0;
  let m = TreeDepth(pRoot.left) + 1;  // 这个 1 是指的是当前这个根节点的高度
  let n = TreeDepth(pRoot.right) + 1;
  return m>n?m:n;
}
```

### JZ77 按之字形顺序打印二叉树
主要考察层序遍历，需要用一个队列存储每一层的结果
```javascript
// 和层序遍历类似，只是需要换向
function Print(pRoot){
  if(!pRoot)return [];
  let quene = [pRoot];
  let temp = [];  
  // 存储结果
  let res = [];
  let i = 0;
  while(quene.length){
    let one = [];
    while(quene.length){
      let node = quene.shift()
      one.push(node.val);
      if(node.left)temp.push(node.left);
      if(node.right)temp.push(node.right);
    }
    // 加入
    quene.push(...temp);
    if(i%2){
      res.push(one.reverse());
    }else{
      res.push(one)
    }
    i++;
  }
  return res;
}
```

### JZ54 二叉搜索树的第 k 个节点
主要思路就是中序遍历第 k 次就可以了

```javascript
function KthNode(proot, k) {
  let arr = [];
  (function inOrder(proot) {
    if(arr.length >= k || !proot)return;
    if(proot){
      inOrder(proot.left);
      arr.push(proot.val);
      inOrder(proot.right);
    }
  })(proot);
  // 不能查找的情况，如二叉树为空，则返回-1，或者 k 大于 n 等等，也返回-1
  return (!proot || k > arr.length || !k)?-1:arr[k-1];
}
```

### JZ7 重建二叉树
输入某二叉树的前序遍历和中序遍历的结果，请重建出该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字
- 寻找前序遍历序列与中序遍历序列之间的规律，然后二叉树基本都要用到递归，递归解决。
- 前序遍历的第一个节点一定是根节点，但是你不知道后面哪部分是左子树，哪部分是右子树，所以就需要通过前序遍历获得的根节点去中序遍历里面找，然后找到的位置的界，左边为左子树，右边为右子树，然后通过长度就可以知道前序遍历的左子树和右子树了，之后就是递归一直找下去了
- [参考链接](https://blog.csdn.net/Yeoman92/article/details/77868367)
```javascript
function reConstructBinaryTree(pre, vin){
  if(pre.length === 0)return null;
  if(pre.length === 1)return new TreeNode(pre[0]);
  let i = vin.indexOf(pre[0]);
  let node = new TreeNode(pre[0]);  // 建节点
  // 第一个参数用的 i 是左子树的长度
  node.left = reConstructBinaryTree(pre.splice(1,i),vin.splice(0,i));
  pre.shift();  // 把当前节点弹出
  vin.shift();
  node.right = reConstructBinaryTree(pre, vin);
  return node;
}
```

```javascript
{
  let arr = [1,2,3,4,5];
  console.log(arr.splice(0,3));
  console.log(arr);
}
```
    [ 1, 2, 3 ]
    [ 4, 5 ]

### JZ26 树的子结构( * )
判断第二棵树是不是第一棵树的子树
```javascript
// 错误解法
function HasSubtree_(pRoot1, pRoot2){
  let mySet = new Set();
  (function preOrder(pRoot){
    if(pRoot){
      mySet.add(pRoot);  // 这里用 set 存储的是当前整个结构而不是当前节点值
      preOrder(pRoot.left);
      preOrder(pRoot.right);
    }
  })(pRoot1);
  return mySet.has(pRoot2);
}
// set 存储有可能 1 中下面还有，而 2 下面没了，是 null，所以不会一样；
```

```javascript
function isSub(p1, p2) {  // 这个函数会判断根节点固定时，是否为子树，相当于遍历 pRoot2
  if (!p2) return true;  // p2 的下面可以比 p1 的少，并且要先判断这句
  if (!p1) return false;  // 但是 p1 的下面不能比 p2 的少，因为这样就不包含了
  return p1.val === p2.val && isSub(p1.left, p2.left) && isSub(p1.right, p2.right);
}
function HasSubtree(pRoot1, pRoot2) {  // 这个函数移动变化 pRoot1 上的节点作为根节点，相当于遍历 pRoot1
  if (!pRoot1 || !pRoot2) return false;
  return isSub(pRoot1, pRoot2) || HasSubtree(pRoot1.left, pRoot2) || HasSubtree(pRoot1.right, pRoot2);
}
```

### JZ27 二叉树的镜像
```javascript
function Mirror(pRoot) {
  if (!pRoot) return;

  let temp = pRoot.left;
  pRoot.left = pRoot.right;
  pRoot.right = temp;
  Mirror(pRoot.left);
  Mirror(pRoot.right);
  return pRoot;
}
```

### JZ32 从上往下打印二叉树
```javascript
function PrintFromTopToBottom(root) {
  let quene = [];
  let res = [];
  if (root) quene.push(root);
  while (quene.length) {
    let node = quene.shift();
    res.push(node.val);
    if (node.left) quene.push(node.left);
    if (node.right) quene.push(node.right);
  }
  return res;
}
```

### JZ33 二叉搜索树的后序遍历序列( * )
判断该数组是不是某二叉搜索树的后序遍历的结果
- 初始思路是将其转换为中序遍历判断是否递增
- 但是光后序遍历是不能转换为中序遍历的
- 所以这里直接对后序遍历分析其规律
  - 最后一个始终是根节点
  - BST 中，父亲节点大于左子树中的全部节点，但是小于右子树中的全部节点的树
```javascript
function VerifySquenceOfBST(sequence) {
  if(!sequence.length)return false;
  return bst(sequence, 0, sequence.length - 1);
}
function bst(seq, begin, end) {
  let root = seq[end]; // 根节点
  let i = begin;
  for (; i < end; i++) {  // BST 中左子树的结点小于根结点
    if (seq[i] > root) break;  // i 来区分该根节点的左子树区域以及右子树区域
  }
  for (let j = i; j < end; j++) {  // BST 中右子树的节点大于根节点
    if (seq[j] < root) return false;  // i-end 为右子树区域，这里来判断是否符合
  }
  let left = i > begin ? bst(seq, begin, i - 1) : true;  // 判断左子树是不是 BST；
  let right = i < end - 1 ? bst(seq, i, end - 1) : true;  // 判断右子树是不是 BST；
  return left && right;
}
```

### JZ82 二叉树中和为某一值的路径(一)
深度优先
作为参数传递归不需要回退状态，而作为全局变量则则需要在调用后回退状态
```javascript
// 条件是寻到叶子节点且和为 sum
function hasPathSum(root, sum) {
  let flag = false;
  (function Dfs(root, cur) {
    if (!root) return 0;
    cur += root.val;  // 这里需要注意 cur 要作为参数传，这样递归退栈时才是当前状态的值
    if (!root.left && !root.right && cur === sum) {
      flag = true;
    }
    Dfs(root.left, cur);
    Dfs(root.right, cur);
  })(root, 0);
  return flag;
}
```

### JZ34 二叉树中和为某一值的路径(二)
```javascript
// 相对于上一道题就是多一个[]来实时反应当前路径情况
function FindPath(root, expectNumber){
  let res = [];
  (function Dfs(root, cur, arr){
    if(!root) return;
    cur += root.val;
    arr.push(root.val);
    if(!root.left && !root.right && cur === expectNumber){
      res.push(arr);
    }
    Dfs(root.left, cur, [...arr]);  // 注意这里需要对数组进行复制再进行传参，具体解释如下一单元格
    Dfs(root.right, cur, [...arr]);
  })(root, 0, []);
  return res;
}
```

- 在递归的过程中，cur 作为变量传参是没有问题的，当进入下一个递归时，它会加上 root.val，当弹出时，cur 又会回到当前作用域，即 cur 的值还是之前未变化的值；
- 而对象的话就不行了，javascript 会为 arr 开辟内存，arr 只是一个指针指向这个内存上的数组，传参传指针的话，虽然指针是变化的，但是指向的内存中的数组并没有变化，反应在该题中就会使一直 push，回到之前作用域时也不会减少，即增加了并没有还回来，所以变化了，这是不对的；
- 所以这里需要对数组进行浅复制再传参才能保证各个作用域有自己当前独特的 arr，而不是各个作用域的 arr 都是一个

### JZ36 二叉搜索树与双向链表（好好看）
佩服第一次做这道题的自己
第二次看这道题脑子没转过来，最终的 return 可以不一定返回根节点，也可以是左右自己需要的节点
```javascript
// 树中节点的左指针需要指向前驱，树中节点的右指针需要指向后继
function Convert(pRootOfTree) {
  if(!pRootOfTree)return pRootOfTree;
  let res = (function Bst(pRoot, isLeft) {
    if (!pRoot) return null;
    let left = Bst(pRoot.left, true);  // 这里需要返回子树中最大的节点；
    let right = Bst(pRoot.right, false);  // 这里需要返回子树中最小的节点；    
    if (left) {  // 连接左半部分
      left.right = pRoot;
      pRoot.left = left;
    }
    if (right) {  // 连接右半部分
      pRoot.right = right;
      right.left = pRoot;
    }
    // isLeft 为 true，返回右节点(最大)，否则返回左节点(最小)；
    // isLeft 后面的是为了：有可能左右节点仅有其一
    return isLeft ? (right?right:pRoot) : (left?left:pRoot);
  })(pRootOfTree, false);
  while(res && res.left){  // 移动到最左边
    res = res.left;
  }
  return res;
}
```

### JZ79 判断是不是平衡二叉树
```javascript
function IsBalanced_Solution(pRoot) {
  let res = true;
  (function Dfs(pRoot) {
    if (!pRoot) return 0;
    let m = Dfs(pRoot.left) + 1;
    let n = Dfs(pRoot.right) + 1;
    if (m - n > 1 || n - m > 1) res = false;
    return m > n ? m : n;
  })(pRoot)
  return res;
}
```

### JZ8 二叉树的下一个结点
- 节点没有右子树：需要找到包含左子树的祖宗节点，就是下一个节点
- 节点有右子树：需要找到该右子树的最左节点
```javascript
function GetNext(pNode){
  if(!pNode)return null;
  if(!pNode.right){
    while(pNode.next){  // 解决{1,2,#,#,3,#,4}这种情况；
      if(pNode.next.left === pNode)return pNode.next;
      pNode = pNode.next;
    }
    return null;
  }
    
  let pos = pNode.right;
  while(pos.left){
    pos = pos.left;
  }
  return pos;
}
```

### JZ28 对称的二叉树
```javascript
function isSymmetrical(pRoot) {
  let res = (function isSame(root1, root2) {
    if (!root1 && !root2) return true;
    if (!root1 || !root2) return false;
    return root1.val === root2.val &&
      isSame(root1.left, root2.right) &&
      isSame(root1.right, root2.left)
  })(pRoot, pRoot);  // 这里传两次自己
  return res;
}
```

### JZ78 把二叉树打印成多行
```javascript
function Print_(pRoot){
  if(!pRoot) return [];
  let res = [];
  let quene = [pRoot];
  while(quene.length){
    let temp = [...quene];
    let one = [];
    while(quene.length){
      one.push(quene.shift().val);
    }
    res.push(one);
    while(temp.length){
      let node = temp.shift();
      if(node.left) quene.push(node.left);
      if(node.right) quene.push(node.right);
    }
  }
  return res;
}
```

### JZ37 序列化二叉树
```javascript
/* function TreeNode(x) {
    this.val = x;
    this.left = null;
    this.right = null;
} */
function Serialize(pRoot) {
  let res = '';
  (function preOrder(pRoot) {
    if (pRoot) {
      res += pRoot.val;
      res += ' ';
      preOrder(pRoot.left);
      preOrder(pRoot.right);
    } else {
      res += '# ';
    }
  })(pRoot);
  return res;
}

function Deserialize(s) {
  let arr = s.split(' ');
  let i = 0;
  return (function createTree(arr) {
    if (i >= arr.length || arr[i] === '#') {
      i++;
      return null;
    }
    let curNode = new TreeNode(arr[i++]);
    curNode.left = createTree(arr);
    curNode.right = createTree(arr);
    return curNode;
  })(arr)
}
```

### JZ84 二叉树中和为某一值的路径(三)( * )
还是经典的空间换时间，用一个 map 就把遍历的信息存储下来了，重要的是如何存，这个 map 存储的是什么比较妙
```javascript
// https://uploadfiles.nowcoder.com/images/20211204/397721558_1638599045074/8987883CDC069556BD9ED9420A829FB9
function FindPath_(root, sum) {
  const mp = new Map();  // 存储之前的路径和，以及路径数
  mp.set(0, 1);
  return (function Dfs(root, sum, cur) {
    if (!root) return 0;
    let res = 0,
      temp = root.val + cur;
    if (mp.has(temp - sum)) {  // 判断 temp 截断 mp 中的值有没有等于 sum，如果等于则说明这一条或几条的路径的部分是满足的
      res += mp.get(temp - sum);
    }
    let value = mp.has(temp) ? mp.get(temp) + 1 : 1;
    mp.set(temp, value)  // map 是不能直接 mp[temp] = value 这样设值的
    res += Dfs(root.left, sum, temp);
    res += Dfs(root.right, sum, temp);
    if (mp.has(temp)) mp.set(temp, mp.get(temp) - 1);
    return res;
  })(root, sum, 0);
}
```

### JZ86 在二叉树中找到两个节点的最近公共祖先
```javascript
// 题目规定所有节点唯一
// 整体思路就是最后一步的 return:判断左右子树或者当前节点时候存在一个节点，以及加入结果那一步
function lowestCommonAncestor(root, o1, o2) {
  let res = [];
  (function Dfs(root) {
    if (!root) return false;
    let left = Dfs(root.left);
    let right = Dfs(root.right);
    let flag1 = (root.val === o1); // 当前节点是否满足
    let flag2 = (root.val === o2);
    if ((left && right) || ((flag1 || flag2) && (left || right))){
      // 1.左右都存在 2.当前节点存在一个，左右存在一个
      res.push(root.val);
    } 
    return left || right || flag1 || flag2;
  })(root);
  return res[0];
}
// [3,5,1],5,1  ---- 1
// 那么如何保证是它的父节点呢
```

### JZ68 二叉搜索树的最近公共祖先
这道题也可以使用上面的题解(JZ86)解决，但是没有运用到二叉搜索树的性质，下面就可以运用到该性质；
1. 如果当前节点值比 p 和 q 都小，证明 q 与 p 在当前节点右子树中，应该在右子树中找
2. 如果当前节点值比 p 和 q 都大，证明 q 与 p 在当前节点左子树中，应该在左子树中找
3. 如果当前节点值介于 p 和 q 之间，证明找到了
```javascript
function lowestCommonAncestor_(root, p, q) {
  let res = 0;
  (function Dfs(root){
    if(!root || res) return;  // 增加 res 是为了得到结果后尽快返回
    if(root.val < p && root.val < q) Dfs(root.right);
    else if(root.val > p && root.val > q) Dfs(root.left);
    else res = root.val;
  })(root);
  return res;
}
```

## 搜索算法
```javascript
// 二分查找
var search = function(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
      const mid = Math.floor((high - low) / 2) + low;
      const num = nums[mid];
      if (num === target) {
          return mid;
      } else if (num > target) {
          high = mid - 1;
      } else {
          low = mid + 1;
      }
  }
  return -1;
};
```

### JZ53 数字在升序数组中出现的次数
```javascript
function GetNumberOfK(data, k) {
  let low = 0, high = data.length - 1;
  while (low <= high) {
    let mid = Math.floor((high - low) / 2) + low;
    let num = data[mid];
    if (num === k) {
      let count = 0;
      for (let i = mid; data[i] === k; i++)count++;
      for (let i = mid - 1; data[i] === k; i--)count++;
      return count;
    } else if (num > k) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return 0;
}
```

### JZ4 二维数组中的查找
```javascript
var search = function(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
      const mid = Math.floor((high - low) / 2) + low;
      const num = nums[mid];
      if (num === target) {
          return mid;
      } else if (num > target) {
          high = mid - 1;
      } else {
          low = mid + 1;
      }
  }
  return -1;
};
function Find(target, array) {
  let col = array[0].length-1;
  for(; col >= 0; col--){  // 去除不可能的列
    if(target >= array[0][col])break;
  }
  if(col < 0)return false;
  let row = array.length-1;
  for(; row >= 0; row--){  // 去除不可能的行
    if(target >= array[row][0])break;
  }
  if(row < 0)return false;

  for(;row >= 0; row--){
    // 二分查找被切分的每行
    if(search(array[row].slice(0,col+1), target) !== -1){
      return true;
    }
  }
  return false;
}
```

### JZ11 旋转数组的最小数字( * )
- 这种二分查找难就难在，arr[mid]跟谁比.
- 目的是：当进行一次比较时，一定能够确定答案在 mid 的某一侧

这里我们把 target 看作是右端点，来进行分析，那就要分析以下三种情况，看是否可以达到上述的目标。

- 情况 1，arr[mid] > target：4 5 6 1 2 3
arr[mid] 为 6， target 为右端点 3， arr[mid] > target, 说明[first ... mid] 都是 >= target 的，因为原始数组是非递减，所以可以确定答案为 [mid+1...last]区间,所以 first = mid + 1
- 情况 2，arr[mid] < target:5 6 1 2 3 4
arr[mid] 为 1， target 为右端点 4， arr[mid] < target, 说明答案肯定不在[mid+1...last]，但是 arr[mid] 有可能是答案,所以答案在[first, mid]区间，所以 last = mid;
- 情况 3，arr[mid] == target:
如果是 1 0 1 1 1， arr[mid] = target = 1, 显然答案在左边
如果是 1 1 1 0 1, arr[mid] = target = 1, 显然答案在右边
所以这种情况，不能确定答案在左边还是右边，那么就让 last = last - 1;慢慢缩少区间，同时也不会错过答案。

- 对于情况 1：因为 mid>target 那么就说明截断的数组是在 mid 之后，不然因为两部分分别都是递增的，即是不可能的；
- 对于情况 2：因为 mid\<target 那么就说明 mid---target 是递增的，即最小值不可能出现在 mid 之后，但是也有可能会遇到比如[6,1,2,3,4,5]，即可能最小值会出现在前面，即上述中的答案出现在[first, mid]之间

```javascript
function minNumberInRotateArray(rotateArray) {
  let first = 0, last = rotateArray.length - 1;
  while (first < last) {  // 最后剩下一个袁术，就是答案
    if (rotateArray[first] < rotateArray[last]) {
      return rotateArray[first];  // 说明没有被截断提前退出
    }
    let mid = first + ((last - first) >> 1);
    if (rotateArray[mid] > rotateArray[last]) {
      first = mid + 1;  // case1
    }else if(rotateArray[mid] > rotateArray[last]){
      last = mid;   // case2
    }else{   
      last--;   // case3
    }
  }
  return rotateArray[first];
}
```

一般的比较原则有：
- 如果有目标值 target，那么直接让 arr[mid] 和 target 比较即可。
- 如果没有目标值，一般可以考虑 端点

### JZ38 字符串的排列
```javascript
// 错误解法
function Permutation_(str) {
  if (!str) return [];
  let result = new Set();
  let arr = str.split('');
  let len = arr.length;
  // seq 代表当前组成的序列
  (function randomSeq(seq, arr) {
    if(seq.length === len){
      result.add(seq);
      return;
    }
    for(let i = 0;i < arr.length; i++){
      let arrCopy = [...arr];
      seq += arrCopy.splice(i,1);
      randomSeq(seq, arrCopy);
    }

  })('', arr);
  return Array.from(result);
}
```

```javascript
// 官方解法
function swap(arr, p, q) {
  let temp = arr[p];
  arr[p] = arr[q];
  arr[q] = temp;
}
function Permutation(str) {
  if (!str) return [];
  const res = new Set();
  let s = str.split('');
  (function perm(pos, s) {
    if (pos + 1 === s.length) {
      res.add(s.join(''));
      return;
    }
    // for 循环和 swap 的含义：对于“ABC”，
    // 第一次'A' 与 'A'交换，字符串为"ABC", pos 为 0， 相当于固定'A'
    // 第二次'A' 与 'B'交换，字符串为"BAC", pos 为 0， 相当于固定'B'
    // 第三次'A' 与 'C'交换，字符串为"CBA", pos 为 0， 相当于固定'C'
    for (let i = pos; i < s.length; i++) {  // 把剩余所有的都分别固定在第一位，再把剩余子串递归
      swap(s, pos, i);
      perm(pos + 1, s);
      swap(s, pos, i);
      // 回溯的原因：比如第二次交换后是"BAC"，需要回溯到"ABC"
      // 然后进行第三次交换，才能得到"CBA"
    }
  })(0, s)
  return Array.from(res);
}
```

- 交换之后我并没有交换回来
- 官方解法类似于递归版的冒泡排序，只是有一层循环变成了递归
- 进行交换而不是我的错误解法中的拆分复制拼接
- 就是我每次递归都喜欢传递分割后的数组，其实传递 index 就可以了

### JZ44 数字序列中某一位的数字
```javascript
function findNthDigit_(n) {
  let i = 9, j = 1;
  let count = 1;
  for(; i <= n;i*=10*(++j)){
    count += i;
  }
  let t = n - i;
}
```

```javascript
function findNthDigit( n ) {
  let digitCont = 1; //位数
  let bottom = 0, top = 10;
  while(n > (top - bottom) * digitCont){
      n -= (top - bottom) * digitCont;
      digitCont += 1
      bottom = top, top = top * 10;
  }
  //在取件的位置再加下限就得出哪个数字
  let num = parseInt(n / digitCont) + bottom;
  let r = n % digitCont;
  return num.toString()[r]
}
```

## 动态规划
- 很多时候 1234 递推一下就能找到规律

### JZ42 连续子数组的最大和
输入一个长度为 n 的整型数组 array，数组中的一个或连续多个整数组成一个子数组，子数组最小长度为 1。求所有子数组的和的最大值。

主要思路就是之前组成的子数组如果为正，则后续遍历元素时就加上之前数组的长度，如果为负，就舍弃之前的长度，重新开始，同时有一个值始终记录着最大值；
```javascript
function FindGreatestSumOfSubArray(array) {
  let curValue = array[0],
    maxValue = array[0];
  for (let i = 1; i < array.length; i++) {
    curValue = curValue <= 0 ? array[i] : curValue + array[i];
    maxValue = Math.max(maxValue, curValue);
  }
  return maxValue;
}
```

```javascript
{
  console.log(FindGreatestSumOfSubArray([1,-2,3,10,-4,7,2,-5]));
}
```
    18

### JZ85 连续子数组的最大和(二)
输入一个长度为 n 的整型数组 array，数组中的一个或连续多个整数组成一个子数组，找到一个具有最大和的连续子数组。

1. 子数组是连续的，比如[1,3,5,7,9]的子数组有[1,3]，[3,5,7]等等，但是[1,3,7]不是子数组
2. 如果存在多个最大和的连续子数组，那么返回其中长度最长的，该题数据保证这个最长的只存在一个
3. 该题定义的子数组的最小长度为 1，不存在为空的子数组，即不存在[]是某个数组的子数组
4. 返回的数组不计入空间复杂度计算

主要思路和之前的方法一致，区别就是要保存一下最大值对应的左右指针；
```javascript
function FindGreatestSumOfSubArray_(array) {
  let curValue = array[0],
    maxValue = array[0],
    left = 0,
    right = 0;
  for (let i = 1; i < array.length; i++) {
    if (curValue < 0) {
      curValue = array[i];
      left = i;
    } else {
      curValue += array[i];
    }
    if (curValue >= maxValue) {
      maxValue = curValue;
      right = i;
    }
  }
  return left<=right?array.slice(left, right+1):[maxValue];  // 全是负数就只能选择其中一个最大的数返回
}
```

```javascript
{
  console.log(FindGreatestSumOfSubArray_([1,-2,3,10,-4,7,2,-5]));
}
```

### JZ69 跳台阶
一只青蛙一次可以跳上 1 级台阶，也可以跳上 2 级。求该青蛙跳上一个 n 级的台阶总共有多少种跳法（先后次序不同算不同的结果）。

主要思路就是所有的台阶都可以理解为分两步来跳，第一种跳一步，再跳一步；第二种直接一下跳两步；然后其中的第一步可以是子问题的最优解。
![](https://oss.justin3go.com/blogs/Pasted%20image%2020220915173050.png)
```javascript
// 递归解法
function jumpFloor(number) {
  if(number <= 2)return number;
  else return jumpFloor(number-2)+jumpFloor(number-1);
}
```

```javascript
console.log(jumpFloor(7));
```
    21

```javascript
// 动态规划解法
function jumpFloor1(number){
  const F = [0, 1, 2];
  for(let i = 3; i <= number; i++){
    F.push(F[i-1] + F[i-2]);
  }
  return F[number];
}
// 但其实只会前两个变量，所以可以只用两个变量存储前值，一个变量存储当前值也能做出来
```

```javascript
console.log(jumpFloor1(7));
```
    21

### JZ10 斐波那契数列
```javascript
function Fibonacci(n){
  const F = [0, 1];
  for(let i = 2; i <= n; i++){
    F.push(F[i-1] + F[i-2]);
  }
  return F[n];
}
```

```javascript
console.log(Fibonacci(4));
```
    3

### JZ19 正则表达式匹配
请实现一个函数用来匹配包括'.'和'*'的正则表达式。
1. 模式中的字符'.'表示任意一个字符
2. 模式中的字符'*'表示它前面的字符可以出现任意次（包含 0 次）。
在本题中，匹配是指字符串的所有字符匹配整个模式。例如，字符串"aaa"与模式"a.a"和"ab*ac*a"匹配，但是与"aa.a"和"ab*a"均不匹配

主要思路就是**从前往后匹配**的话就是：
1. 遇到相同的如`a--a`、`a--点`就匹配下一个；
2. 而遇到`a*`，`b*`的就把两位看作是一个整体，然后这个有多种情况，多种情况在**本次**又可以总结为两种情况，一种是匹配完后就继续留给后面的使用，另一种就是匹配完后就直接丢弃，而这不正是递归和动态规划中的**多个子问题**么，只是由求最值变成了是否匹配罢了；
3. 遇到`*`的状态转移方程是：
	1. `b*`匹配完 a 后，继续使用：`f[i-1][j]`
	2. `b*`匹配完 a 后，直接舍弃：`f[i][j-2]`
	[参考链接](https://www.nowcoder.com/practice/28970c15befb4ff3a264189087b99ad4?tpId=13&tqId=1375406&ru=%2Fpractice%2F8c82a5b80378478f9484d87d1c5f12a4&qru=%2Fta%2Fcoding-interviews%2Fquestion-ranking&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D1%26tpId%3D13%26type%3D13)
```javascript
function match(str, pattern) {
  let m = str.length,
    n = pattern.length;
  function match_(i,j){
    if(i==0)return false;  // 最终是否结束匹配是由 j 控制的
    if(pattern[j-1] == '.')return true;
    return str[i-1]== pattern[j-1];
  }
  // 初始化记录表，该二维表下标 ij，对应的值就是 str[i]与 pattern[j]是否匹配的 boolean 值
  let f = new Array(m+1).fill(0);
  f.forEach((val, i, arr)=>{
    arr[i] = new Array(n+1).fill(0);
  })
  f[0][0] = 1;  // 边界条件，两个空字符串是可以匹配的
  // 从前往后匹配，当前的值依赖于前面子问题的值
  for(let i = 0; i <= m; i++){  // 0 表示 str 为空
    for(let j = 1; j <= n; j++){
      if(pattern[j-1] == '*'){ // j-1 理解为 j 就行了，只是边界处理
        f[i][j] |= f[i][j-2];  // b*匹配完 a 后，就舍弃
        if(match_(i,j-1)) f[i][j] |= f[i-1][j];  // b*匹配完 a 后，继续使用：
      }else{
        if(match_(i,j))f[i][j] |= f[i-1][j-1];
      }
    }
  }
  console.log(f);
  return Boolean(f[m][n]);
}
```

```javascript
console.log(match("aaab","a*a*a*c"));
console.log(match("aad","c*a*d"));
console.log(match("aaa","a*a"));

/* 'aaa', 'ab*ac*a'
    a b * a c * a
  1 0 0 0 0 0 0 0
a 0 1 0 1 0 0 0 0
a 0 0 0 0 1 0 1 0
a 0 0 0 0 0 0 0 1
*/
```


### JZ71 跳台阶扩展问题
一只青蛙一次可以跳上 1 级台阶，也可以跳上 2 级……它也可以跳上 n 级。求该青蛙跳上一个 n 级的台阶(n 为正整数)总共有多少种跳法。

和基础跳台阶问题一致，只是变成了可以跳 n 级台阶了，所以在在跳最后一步的时候，就可以从倒数第二步跳到最后一步，从倒数第三步跳到最后一步.....从第一步跳到最后一步，所以最后一步的状态转移方程就为 f(n) = f(n-1)+f(n-2)+...+f(1)+f(0)

[补充(可用数学方法整理该式)](https://www.nowcoder.com/practice/22243d016f6b47f2a6928b4313c85387?tpId=13&tqId=23262&ru=%2Fpractice%2F28970c15befb4ff3a264189087b99ad4&qru=%2Fta%2Fcoding-interviews%2Fquestion-ranking&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D1%26tpId%3D13%26type%3D13)
```javascript
// 递归解法
{
  function jumpFloorII(number){
    if(number <= 2)return number;
    else{
      let sum = 1;
      for(let i = number-1; i>0; i--){
        sum += jumpFloorII(i);
      }
      return sum;
    }
  }
  jumpFloorII(10);
}
```
    512

```javascript
// 动态规划解法
{
  function jumpFloorII_(number) {
    let F = [0, 1, 2];
    let sum = 1;
    for (let i = 2; i < number; i++) {
      F.push(F[i] + sum + 1);
      sum += F[i];
    }
    return F[number];
  }
  console.log(jumpFloorII_(10));
}
```
    512

### JZ70 矩形覆盖
我们可以用 `2*1` 的小矩形横着或者竖着去覆盖更大的矩形。请问用 n 个 `2*1` 的小矩形无重叠地覆盖一个 `2*n` 的大矩形，从同一个方向看总共有多少种不同的方法？

没找到好理解的思路，一个个算出来就能找到规律
```javascript
// 递归解法
{
  function rectCover(number) {
    if (number <= 2) return number;
    else {
      return rectCover(number - 1) + rectCover(number - 2);
    }
  }
  console.log(rectCover(4));
}
// 动态规划也和前面一样
```
    5

### JZ63 买卖股票的最好时机(一)
假设你有一个数组 prices，长度为 n，其中 prices[i]是股票在第 i 天的价格，请根据这个价格数组，返回买卖股票能获得的最大收益
1. 你可以买入一次股票和卖出一次股票，并非每天都可以买入或卖出一次，总共只能买入和卖出一次，且买入必须在卖出的前面的某一天
2. 如果不能获取到任何利润，请返回 0
3. 假设买入卖出均无手续费

**思路：**
对于每天有到此为止的最大收益和是否持股两个状态，因此我们可以用动态规划，推出两种状态的状态转移方程。
**具体做法：**
![](https://oss.justin3go.com/blogs/Pasted%20image%2020220916165222.png)
```javascript
function maxProfit(prices) {
  // 相比于连续子数组求最大和多了这一步
  let pricesSub = [];
  for (let i = 1; i < prices.length; i++) {
    pricesSub.push(prices[i] - prices[i - 1])
  }
  // 然后再求这个数组的连续最大和就可以了
  let curValue = pricesSub[0],
    maxValue = pricesSub[0];
  for (let i = 1; i < pricesSub.length; i++) {
    curValue = curValue <= 0 ? pricesSub[i] : curValue + pricesSub[i];
    maxValue = Math.max(maxValue, curValue);
  }
  return (!maxValue || maxValue < 0) ? 0 : maxValue;
}
```

```javascript
maxProfit([8,9,2,5,4,7,1])
```
    5

### JZ47 礼物的最大价值
```javascript
function maxValue(grid) {
  let gridFill = (function arrFill0(grid) {
    let n = grid[0].length;
    grid.unshift(new Array(n).fill(0));
    grid.forEach((val, i, arr) => {
      arr[i].unshift(0);
    })
    return grid;
  })(grid)
  let m = gridFill.length,
  n = gridFill[0].length;
  for(let i = 1; i < m; i++){
    for(let j = 1; j < n; j++){
      gridFill[i][j] += Math.max(gridFill[i-1][j],gridFill[i][j-1])  // 重点
    }
  }
  return gridFill[m-1][n-1];
} 
console.log(maxValue([[1,3,1],[1,5,1],[4,2,1]]));
```
    12

### JZ48 最长不含重复字符的子字符串
注意 map 存储的键值是什么
```javascript
function lengthOfLongestSubstring(s) {
    const myMap = new Map();  // 存储字符的最近下标
    let res = 0,
        tmp = 0;  // 关键在于 tmp 的更新策略
    for (let i = 0; i < s.length; i++) {
        if (myMap.has(s[i])) {
            // tmp = Math.min(i - myMap.get(s[i]), tmp);
            let j = i - myMap.get(s[i])
            // 当跨度超过本身时，就 tmp++，而不是修改 tmp=j；因为 j 跨过的区域包含两个其他的相同字符串
            tmp = j > tmp?tmp+1:j  
        } else {
            tmp++;
        }
        myMap.set(s[i], i);
        res = Math.max(res, tmp);
        // console.log(`第${i}次中：tmp：${tmp}，res：${res}，字符：${s[i]}`)
    }
    return res
}
```

### JZ46 把数字翻译成字符串
```javascript
// TODO 还是有两种情况过不了，不过基本思想是对的，这个 0 确实感觉没说清楚，后续再来看看
// if(nums == "72910721221427251718216239162221131917242")return 129792;
// if(nums == "72416145196211821232022471311148103136128331523141061051992231223")return 11520000;
function solve(nums) {
    if (nums == '0') return 0;
    const F = [1], FN = [0];
    let prev1 = 1, prev2 = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] == '0') {  // 边缘情况
            if (nums[i - 1] > 2) return 0;
            if (i < nums.length - 1 &&
                nums[i + 1] == '0')
                return 0;
        }
        if (parseInt(nums[i - 1] + nums[i]) > 26) {
            F[i] = 0  // 结合不了
        } else {
            F[i] = prev2;  // 结合
        }
        FN[i] = nums[i] == 0 ? 0 : prev1;  // 不结合，且如果为 0 会减少一种
        // 移动前一位值与前两位值，为下一次计算准备
        prev2 = prev1;
        prev1 = FN[i] + F[i];
    }
    let n = F.length - 1;
    console.log(F);
    console.log(FN);
    return F[n] + FN[n];
}
```

## 回溯
### JZ12 矩阵中的路径
```javascript
function getRecord(m, n) {
  const record = new Array(m).fill(0);
  record.forEach((val, i, arr) => {
    arr[i] = new Array(n).fill(0);
    arr[i].push(1);  // 制造围墙
    arr[i].unshift(1);
  })
  record.push(new Array(n+2).fill(1));
  record.unshift(new Array(n+2).fill(1));
  return record;
}
console.log(getRecord(2,2));
```
    [ [ 1, 1, 1, 1 ], [ 1, 0, 0, 1 ], [ 1, 0, 0, 1 ], [ 1, 1, 1, 1 ] ]


```javascript
function hasPath_(matrix, word) {
    let m = matrix.length,
        n = matrix[0].length,
        l = word.length,
        res = false;
    function DFS(i, j, record, k) {
        if (k == l) {
            res = true;
            return;
        }
        if (record[i - 1 + 1][j + 1] == 0 && matrix[i - 1][j] == word[k]) {
            record[i - 1 + 1][j + 1] = 1;
            DFS(i - 1, j, record, k + 1);
        }
        if (record[i + 1 + 1][j + 1] == 0 && matrix[i + 1][j] == word[k]) {
            record[i + 1 + 1][j + 1] = 1;
            DFS(i + 1, j, record, k + 1)
        }
        if (record[i + 1][j - 1 + 1] == 0 && matrix[i][j - 1] == word[k]) {
            record[i + 1][j - 1 + 1] = 1;
            DFS(i, j - 1, record, k + 1)
        }
        if (record[i + 1][j + 1 + 1] == 0 && matrix[i][j + 1] == word[k]) {
            record[i + 1][j + 1 + 1] = 1;
            DFS(i, j + 1, record, k + 1)
        }
    }
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] == word[0]) {
                const record = getRecord(m, n);
                record[i + 1][j + 1] = 1;
                DFS(i, j, record, 1);
            }
        }
    }
    return res
}
```

```javascript
// 思路不变，优化代码
function hasPath(matrix, word) {
    let m = matrix.length,
        n = matrix[0].length,
        l = word.length;
    function DFS(i, j, record, k) {
        if (k == l) return true;
        if (!(record[i + 1][j + 1] == 0 && matrix[i][j] == word[k])) return false;
        record[i + 1][j + 1] = 1;
        let res = DFS(i - 1, j, record, k + 1) ||
            DFS(i + 1, j, record, k + 1) ||
            DFS(i, j - 1, record, k + 1) ||
            DFS(i, j + 1, record, k + 1);
        record[i + 1][j + 1] = 0;
        return res
    }
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] == word[0]) {
                const record = getRecord(m, n);
                if (DFS(i, j, record, 0)) return true;
            }
        }
    }
    return false
}
```

```javascript
console.log(hasPath([['a', 'b', 'c', 'e'], ['s', 'f', 'c', 's'], ['a', 'd', 'e', 'e']], "abcced"));
console.log(hasPath([['a', 'b', 'c', 'e'], ['s', 'f', 'c', 's'], ['a', 'd', 'e', 'e']], "abcb"));
console.log(hasPath([['a', 'b', 'c', 'e'], ['s', 'f', 'c', 's'], ['a', 'd', 'e', 'e']], "see"));
```
    true
    false
    true


### JZ13 机器人的运动范围
```javascript
function isPass(threshold, row, col) {
  let rSum = row.toString().split('').reduce((prev, cur) => {
    return parseInt(prev) + parseInt(cur);
  })
  let cSum = col.toString().split('').reduce((prev, cur) => {
    return parseInt(prev) + parseInt(cur);
  })
  return threshold >= parseInt(cSum) + parseInt(rSum);
}
console.log(isPass(10, 1, 1));
console.log(isPass(18, 35, 38));
```
    true
    false

```javascript
function getRecord(m, n) {
  const record = new Array(m).fill(0);
  record.forEach((val, i, arr) => {
    arr[i] = new Array(n).fill(0);
    arr[i].push(1);  // 制造围墙
    arr[i].unshift(1);
  })
  record.push(new Array(n+2).fill(1));
  record.unshift(new Array(n+2).fill(1));
  return record;
}
```

```javascript
function movingCount(threshold, rows, cols) {
  let count = 0,
    record = getRecord(rows, cols);
  function DFS(r, c) {
    if(record[r][c] == 0 && isPass(threshold, r-1, c-1)){
      record[r][c] = 1;
      count++;
      DFS(r-1,c);
      DFS(r+1,c);
      DFS(r,c-1);
      DFS(r,c+1);
    }
  }
  DFS(1,1)
  return count;
}
```

```javascript
console.log(movingCount(1, 2, 3));  // 3
console.log(movingCount(0, 1, 3));  // 1
console.log(movingCount(10, 1, 100));  // 29
console.log(movingCount(5, 10, 10));  // 21
```
    3
    1
    29
    21


## 排序
### JZ3 数组中重复的数字
```javascript
function swap(arr, p, q) {
  let tmp = arr[p];
  arr[p] = arr[q];
  arr[q] = tmp;
}
```

```javascript
// 基数排序
function duplicate(numbers) {
  // write code here
  let i = 0, n = numbers.length;
  while (i < n) {
      if (numbers[i] == i) i++;
      else {
          if (numbers[i] == numbers[numbers[i]]) return numbers[i];
          else swap(numbers, i, numbers[i])
      }
  }
  return -1;
}
```

```javascript
duplicate([2,3,1,0,2,5,3])
```
    2

### JZ51 数组中的逆序对
```javascript
function InversePairs(data) {
  let count = 0;
  function merge(left, right) {
    // 将两个有序数组合并为一个有序数组
    const res = [];
    while (left.length && right.length) {
      if (left[0] < right[0]) {
        res.push(left.shift());
      } else {
        count += left.length;  // 相对于之前的合并排序，仅仅增加了这步，画图就很好理解
        res.push(right.shift());
      }
    }
    if (left.length) res.push(...left);
    if (right.length) res.push(...right);
    return res;
  }
  function mergeSort(arr) {
    // 利用递归实现分治的思想
    if (arr.length <= 1) return arr;
    let mid = Math.floor(arr.length / 2);
    let left = mergeSort(arr.slice(0, mid));
    let right = mergeSort(arr.slice(mid, arr.length));
    return merge(left, right);
  }
  mergeSort(data);
  return count % 1000000007
}
```

```javascript
console.log(InversePairs([1,2,3,4,5,6,7,0]));
```
    7

### JZ40 最小的 K 个数
```javascript
function GetLeastNumbers_Solution_(input, k) {
  function heapSort(arr) {  // 维护小根堆的堆排序
    let len = arr.length;
    function siftDown(start, end) {
      let root = start;
      while (true) {
        let child = 2 * root + 1;
        if (child > end) break;
        if (
          child + 1 <= end &&
          arr[child] > arr[child + 1]
        )
          child++;
        if (arr[root] > arr[child]) {
          [arr[root], arr[child]] = [arr[child], arr[root]];
          root = child;
        } else break;
      }
    }
    for (let start = Math.floor((len - 2) / 2); start >= 0; start--) {
      siftDown(start, len - 1);
    }
    for (let end = len - 1; end >= len - k; end--) {   // 修改为排后 k 个就够了
      [arr[0], arr[end]] = [arr[end], arr[0]];
      siftDown(0, end - 1);
    }
    return arr.slice(len-k, len);
  }
  return heapSort(input);
}
```

```javascript
console.log(GetLeastNumbers_Solution_([4, 5, 1, 6, 2, 7, 3, 8], 4));
console.log(GetLeastNumbers_Solution_([1], 0));
console.log(GetLeastNumbers_Solution_([0, 1, 2, 1, 2], 3));
```
    [ 4, 3, 2, 1 ]
    []
    [ 1, 1, 0 ]

```javascript
function GetLeastNumbers_Solution(A, k){
  let l = 0, r = A.length-1; 
  if(r == 0)return A.slice(0,k);
  if(k == 0)return [];
  // 快速选择
  function LomutoPartition(A, l, r) {
    let p = A[l];
    let s = l;
    // 通过 i 指针遍历，每次找到比 p 小的数，就扩大 s 的范围，然后交换，所以就形成了我们想要的结果：[0,s]是小于 p 的，(s,len)是大于等于 p 的
    for (let i = l + 1; i <= r; i++) {
      if (A[i] < p) {
        s++;
        [A[s], A[i]] = [A[i], A[s]];
      }
    }
    [A[s], A[l]] = [A[l], A[s]];
    return s;
  }
  // A：数组， l,r：左右指针，k：选择的第 k 小
  function quickSelect(A, l, r, k) {
    let s = LomutoPartition(A, l, r);
    if (s === l + k - 1) {
      return A.slice(0,s+1);
    } else if (s > l + k - 1) {
      A[s] = quickSelect(A, l, s - 1, k);
      return A[s];
    } else {
      A[s] = quickSelect(A, s + 1, r, l + k - 1 - s);
      return A[s];
    }
  }
  return quickSelect(A,l,r,k);
}
```

```javascript
console.log(GetLeastNumbers_Solution([4, 5, 1, 6, 2, 7, 3, 8], 4));
console.log(GetLeastNumbers_Solution([1], 0));
console.log(GetLeastNumbers_Solution([0, 1, 2, 1, 2], 3));
```
    [ 3, 1, 2, 4 ]
    []
    [ 0, 1, 1 ]

### JZ41 数据流中的中位数
```javascript
// 试试插入排序
const midArr = [];
function Insert(num) {
  let i = 0;
  while(i < midArr.length){
    if(num < midArr[i])break;
    i++;
  }
  midArr.splice(i,0,num)
}
function GetMedian() {
  let len = midArr.length;
  let mid = Math.floor(len/2);
  if(len%2 == 1) return (midArr[mid]).toFixed(2);
  else return ((midArr[mid]+midArr[mid-1])/2).toFixed(2);
}
```

```javascript
{
  let testData = [5, 2, 3, 4, 1, 6, 7, 0, 8]
  for (let val of testData) {
    Insert(val);
    console.log(GetMedian());
  }
}
```
    5.00
    3.50
    3.00
    3.50
    3.00
    3.50
    4.00
    3.50
    4.00


## 位运算
### JZ65 不用加减乘除做加法
```javascript
// 官方解法
function Add(num1, num2){
  while(num2 != 0){
    // 无进位和运算就是按位异或结果，进位就是与运算结果但是需要左移一位，
    let c = (num1 & num2) << 1; 
    num1 ^= num2;
    num2 = c;
  }
  return num1
}
```

```javascript
Add(-11,2)
```
    -9

### JZ15 二进制中 1 的个数

举个例子：一个二进制数 1100，从右边数起第三位是处于最右边的一个 1。
减去 1 后，第三位变成 0，它后面的两位 0 变成了 1，而前面的 1 保持不变，
因此得到的结果是 1011.我们发现减 1 的结果是把最右边的一个 1 开始的所有位都取反了。
这个时候如果我们再把原来的整数和减去 1 之后的结果做与运算，
从原来整数最右边一个 1 那一位开始所有位都会变成 0。如 1100&1011=1000.
也就是说，把一个整数减去 1，再和原整数做与运算，会把该整数最右边一个 1 变成 0.
那么一个整数的二进制有多少个 1，就可以进行多少次这样的操作。

```javascript
function NumberOf1(n) {
  let count = 0;
  while(n){
    count++
    n = (n-1)&n;
  }
  return count;
}
```

```javascript
console.log(NumberOf1(10));
```
    2


### JZ16 数值的整数次方
```javascript
function Power(base, exponent) {
  if (exponent < 0) {  // 常识处理负数
    base = 1 / base;
    exponent = -exponent;
  }
  let x = base;
  let ret = 1.0;
  while (exponent) {  // 2^10110 = 2^10*2^100*2^10000
    if (exponent & 1) {  //
      ret *= x;  // 二进制位数是 1 的，乘进答案
    }
    x *= x;  // 10-->100,移位数
    console.log(x);
    exponent >>= 1;
  }
  return ret
}
```

```javascript
console.log(Power(2.00000,3));
```
    4
    16
    8

### JZ56 数组中只出现一次的两个数字
```javascript
function FindNumsAppearOnce(array) {
  let tmp = 0;
  array.forEach((val) => {  // 迭代异或可以去除那些两个相同值得影响，得到得是不相同得两个数的异或
    tmp ^= val;
  })
  // 找到可以用来分组进行与运算的数
  let mask = 1;
  while ((tmp & mask) == 0) {
    mask <<= 1;
  }
  let a = 0, b = 0;
  array.forEach((val) => {
    if ((val & mask) == 0) a ^= val;
    else b ^= val;
  })
  return a < b ? [a, b] : [b, a];
}
```

```javascript
console.log(FindNumsAppearOnce([1,4,1,6]));
console.log(FindNumsAppearOnce([1,2,3,3,2,9]));
```
    [ 4, 6 ]
    [ 1, 9 ]


### JZ64 求 1+2+3+...+n

```javascript
function Sum_Solution(n) {
  n > 1 && (n += Sum_Solution(n-1));
  return n;
}
```

```javascript
Sum_Solution(5)
```
    15

## 模拟
### JZ29 顺时针打印矩阵
```javascript
function printMatrix(matrix) {
  const res = [];
  while (matrix.length && matrix[0].length) {
      res.push(...(matrix.shift()));  // 右
      matrix.forEach((val, i, arr) => {  // 下
          res.push(arr[i].pop())
      });
      // 注意需要判断是否有元素
      matrix.length && res.push(...(matrix.pop().reverse()));  // 右
      for (let i = matrix.length - 1; i >= 0; i--) {  // 上
          matrix[i].length && res.push((matrix[i]).shift())
      }
  }
  return res;
}
```

```javascript
console.log(printMatrix([[1, 2, 3, 4],
                        [5, 6, 7, 8],
                        [9, 10, 11, 12],
                        [13, 14, 15, 16]]));
```
    [
       1,  2,  3,  4, 8, 12,
      16, 15, 14, 13, 9,  5,
       6,  7, 11, 10
    ]


### JZ61 扑克牌顺子
```javascript
function IsContinuous(numbers) {
  let count = 0;
  const record = new Array(14).fill(0);
  numbers.forEach((val, i, arr) => {
    if (val == 0) count++;
    else record[val] = 1;
  })
  for (let i = 0; i < record.length; i++) {
    if (record[i] == 1) {
      for (let j = i; j < record.length && j < i + 5; j++) {
        count += record[j];
      }
      break;
    }
  }
  return count == 5;
}
```

```javascript
console.log(IsContinuous([6, 0, 2, 0, 4]));
console.log(IsContinuous([0, 3, 2, 6, 4]));
console.log(IsContinuous([1, 0, 0, 1, 0]));
console.log(IsContinuous([13, 12, 11, 0, 1]));
```
    true
    true
    false
    false


### JZ67 把字符串转换成整数(atoi)
```javascript
function StrToInt(s) {
  if(!s.length)return 0;
  // 就类似状态转换图,放弃
  return parseInt(s)
}
```

```javascript
console.log(StrToInt(''));
```
    0

### JZ20 表示数值的字符串
```javascript
// 也是画状态转换图
```

## 其他

### JZ66 [构建乘积数组](https://www.nowcoder.com/practice/94a4d381a68b47b7a8bed86f2975db46?tpId=13&tqId=23445&ru=%2Fpractice%2F94a4d381a68b47b7a8bed86f2975db46&qru=%2Fta%2Fcoding-interviews%2Fquestion-ranking&sourceUrl=)
```javascript
function multiply(array) {
  // 不能使用除法
  let leftP = [1], rightP = [1]; // 左的累乘，右的累乘
  for (let i = 1; i < array.length; i++) {  // 左
    let tmp = leftP[leftP.length - 1] * array[i - 1];
    leftP.push(tmp);
  }
  for (let i = array.length - 2; i >= 0; i--) { // 右
    let tmp = rightP[0] * array[i+1];
    rightP.unshift(tmp);
  }
  return leftP.map((val, i, arr)=>val*rightP[i]);  // 合并
}
```

### JZ50 第一个只出现一次的字符
```javascript
function FirstNotRepeatingChar(str) {
  let myMap = new Map();
  for (let i = 0; i < str.length; i++) {
    if(myMap.has(str[i])){
      myMap.set(str[i], [(myMap.get(str[i]))[0] + 1, i]);
    }else{
      myMap.set(str[i], [1, i]);
    }
  }
  for(let val of myMap){
    if(val[1][0] == 1)return val[1][1];
  }
  return -1;
}
```

```javascript
console.log(FirstNotRepeatingChar('google'));
```
    4

### JZ5 替换空格
```javascript
function replaceSpace( s ) {
  return s.replace(/ /g, '%20')
}
```

```javascript
console.log(replaceSpace("We Are Happy"));
```
    We%20Are%20Happy

### JZ21 调整数组顺序使奇数位于偶数前面(一)
```javascript
function reOrderArray( array ) {
  let odd = [], even = [];
  array.forEach((val, i, arr)=>{
    if(val%2==0)even.push(val);
    else odd.push(val);
  })
  return odd.concat(even);
}
```

```javascript
console.log(reOrderArray([1,2,3,4]));
console.log(reOrderArray([2,4,6,5,7]));
console.log(reOrderArray([1,3,5,6,7]));
```
    [ 1, 3, 2, 4 ]
    [ 5, 7, 2, 4, 6 ]
    [ 1, 3, 5, 7, 6 ]

### JZ39 数组中出现次数超过一半的数字
```javascript
function MoreThanHalfNum_Solution(numbers) {
  if(numbers.length == 1)return numbers[0];
  let myMap = new Map();
  let mid = numbers.length/2;
  for(let val of numbers){
    if(myMap.has(val)){
      let c = myMap.get(val);
      if(c+1 > mid)return val;
      myMap.set(val, c+1);
    }else{
      myMap.set(val, 1);
    }
  }
  return;
}
```

```javascript
console.log(MoreThanHalfNum_Solution([1,2,3,2,2,2,5,4,2]));
console.log(MoreThanHalfNum_Solution([3,3,3,3,2,2,2]));
console.log(MoreThanHalfNum_Solution([1]));
```
    2
    3
    1


### JZ43 整数中 1 出现的次数（从 1 到 n 整数中 1 出现的次数）


```javascript
function NumberOf1Between1AndN_Solution(n) {
  let count = 0;
  for (let i = 1; i <= n; i *= 10) {
      // 计算高位和低位
      let a = Math.floor(n / i), b = n % i;
      console.log(`a: ${a}, b: ${b}, pre: ${Math.floor((a + 8) / 10) * i}, last: ${Number(a % 10 == 1) * (b + 1)}`);
      count += Math.floor((a + 8) / 10) * i + Number(a % 10 == 1) * (b + 1);
  }
  return count;
}
```

```javascript
console.log(NumberOf1Between1AndN_Solution(13));
// console.log(NumberOf1Between1AndN_Solution(0));
```
    a: 13, b: 0, pre: 2, last: 0
    a: 1, b: 3, pre: 0, last: 4
    6


### JZ45 把数组排成最小的数
```javascript
// 最开始想复杂了，也许这就是贪心的魅力吧
function PrintMinNumber(numbers) {
  numbers.sort((a, b) => {
    return parseInt(a.toString()+b.toString()) - parseInt(b.toString()+a.toString())
  });
  return numbers.join('');
}
```

```javascript
console.log(PrintMinNumber([11,3]));
console.log(PrintMinNumber([]));
console.log(PrintMinNumber([3,32,321]));
```
    113
    
    321323


### JZ49 丑数
```javascript
function GetUglyNumber_Solution(index) {
  if (index <= 6) return index;
  let i2 = 0, i3 = 0, i5 = 0;
  let res = new Array(index);
  res[0] = 1;
  for (let i = 1; i < index; i++) {
    res[i] = Math.min(res[i2] * 2, res[i3] * 3, res[i5] * 5);
    if (res[i] == res[i2] * 2) i2++;
    if (res[i] == res[i3] * 3) i3++;
    if (res[i] == res[i5] * 5) i5++;
  }
  return res[index - 1]
}
```

```javascript
console.log(GetUglyNumber_Solution(7));
```
    [
      1, 2, 3, 4,
      5, 6, 8
    ]
    8


### JZ74 和为 S 的连续正数序列

```javascript
// 1--n/2+1 的范围进行滑动窗口，整体值大于 target,就左指针移动，小于就右指针移动，等于就加入到 res 数组中
function FindContinuousSequence(sum) {
  // 代码可能有点冗余
  let res = [];
  let mid = Math.min(Math.ceil(sum / 2) + 1, sum - 1);
  let left = 0, right = 1, sum_ = 0;
  while (left < right) { 
    if (sum_ == sum && left!=0) {
      let tmp = new Array(right - left).fill(left).map((v, i) => v + i);
      res.push(tmp);
      sum_ -= (left++);
    } else if (sum_ < sum) {
      sum_ += (right++);
    } else {
      sum_ -= (left++);
    }
  }
  res.pop();
  return res
}
```

```javascript
console.log(FindContinuousSequence(9));
console.log(FindContinuousSequence(3));
```
    [ [ 2, 3, 4 ], [ 4, 5 ] ]
    [ [ 1, 2 ] ]


### JZ57 和为 S 的两个数字
```javascript
function FindNumbersWithSum(array, sum) {
  let left = 0, right = array.length - 1;
  while (left < right) {
    let sum_ = array[left] + array[right];
    if(sum_ > sum) right--;
    else if(sum_ < sum) left++;
    else return [array[left], array[right]]; 
  }
  return [];
}
```

```javascript
console.log(FindNumbersWithSum([1,2,4,7,11,15],15));
```
    [ 4, 11 ]

### JZ58 左旋转字符串
```javascript
function LeftRotateString(str, n) {
  if(!str)return '';
  let pos = n % str.length;
  return str.slice(pos)+str.slice(0,pos)
}
```

```javascript
console.log(LeftRotateString('XYZdefabc', 3));
```
    defabcXYZ

### JZ62 孩子们的游戏(圆圈中最后剩下的数)
```javascript
function LastRemaining_Solution(n, m) {
  let arr = new Array(n).fill(0).map((v, i) => i);
  m--;
  let c = 0;
  for (let i = 0; arr.length > 1;
    i = i < arr.length ? i + 1 : i % arr.length) {
      if(!(i%m)){  // remove
        arr.splice(i--,1);
      }
  }
  return arr[0];
}
```

```javascript
console.log(LastRemaining_Solution(5,3));
```
    4

