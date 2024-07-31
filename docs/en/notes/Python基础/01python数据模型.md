# python 数据模型

> 此笔记记录于《流畅的 python》，大部分为其中的摘要，少部分为笔者自己的理解；笔记为 jupyter 转的 markdown，原始版 jupyter 笔记在[这个仓库](https://github.com/Justin3go/fluent-python-note)

## 起步

python 的一些设计理念

- Guido 知道如何在理论上做出一定妥协，设计出来的语言让使用者觉得如沐春风，这真是不可多得。
- Python 最好的品质之一是一致性。当你使用 Python 工作一会儿后，就会开始理解 Python 语言，并能正确猜测出对你来说全新的语言特征。

python 中的魔术方法：

调用过程：Python 解释器碰到特殊的句法时，会使用特殊方法去激活一些基本的对象操作，这些特殊方法的名字以两个下划线开头，以两个下划线结尾（例如`__getitem__`）。比如`obj[key]`的背后就是`__getitem__`方法，为了能求得`my_collection[key]`的值，解释器实际上会调用`my_collection.__getitem__(key)`。

包含以下几个类别：

- 迭代
- 集合类
- 属性访问
- 运算符重载
- 函数和方法的调用
- 对象的创建和销毁
- 字符串表示形式和格式化
- 管理上下文（即 with 块）

## 纸牌类


```python
import collections
Card = collections.namedtuple('Card', ['rank', 'suit'])
class FrenchDeck:
    ranks = [str(n) for n in range(2, 11)]+list('JQKA')
    suits = 'spades diamonds clubs hearts'.split()
    def __init__(self):
        self._cards = [Card(rank, suit) for suit in self.suits
                                        for rank in self.ranks]
    def __len__(self):
        return len(self._cards)
    def __getitem__(self, position):
        return self._cards[position]

```

上述代码的注意事项：

利用 namedtuple（用以构建只有少数属性但是没有方法的对象），我们可以很轻松地得到一个纸牌对象，这里代表一张纸牌，它由一个 rank（排名）和一个 suit（花色）两个属性构成


```python
[1,2,3] + [2,3,4]
```




    [1, 2, 3, 2, 3, 4]




```python
deck = FrenchDeck()
len(deck)
```




    52



它跟任何标准 Python 集合类型一样，可以用`len()`函数来查看一叠牌有多少张，因为内部实现`__len__`方法，其实就是调用的这个方法。


```python
'spades diamonds clubs hearts'.split()
```




    ['spades', 'diamonds', 'clubs', 'hearts']



python 也已经内置了从一个序列中随机选出一个元素的函数 random.choice


```python
from random import choice


deck = FrenchDeck()
choice(deck)
```




    Card(rank='10', suit='diamonds')



因为__getitem__方法把[]操作交给了 self._cards 列表，所以我们的 deck 类自动支持切片（slicing）操作。


```python
deck[:3]
```




    [Card(rank='2', suit='spades'),
     Card(rank='3', suit='spades'),
     Card(rank='4', suit='spades')]




```python
deck[12::13]
```




    [Card(rank='A', suit='spades'),
     Card(rank='A', suit='diamonds'),
     Card(rank='A', suit='clubs'),
     Card(rank='A', suit='hearts')]




```python
for card in reversed(deck):
    print(card)
```

    Card(rank='A', suit='hearts')
    Card(rank='K', suit='hearts')
    Card(rank='Q', suit='hearts')
    Card(rank='J', suit='hearts')
    Card(rank='10', suit='hearts')
    Card(rank='9', suit='hearts')
    Card(rank='8', suit='hearts')
    Card(rank='7', suit='hearts')
    Card(rank='6', suit='hearts')
    Card(rank='5', suit='hearts')
    Card(rank='4', suit='hearts')
    Card(rank='3', suit='hearts')
    Card(rank='2', suit='hearts')
    Card(rank='A', suit='clubs')
    Card(rank='K', suit='clubs')
    Card(rank='Q', suit='clubs')
    Card(rank='J', suit='clubs')
    Card(rank='10', suit='clubs')
    Card(rank='9', suit='clubs')
    Card(rank='8', suit='clubs')
    Card(rank='7', suit='clubs')
    Card(rank='6', suit='clubs')
    Card(rank='5', suit='clubs')
    Card(rank='4', suit='clubs')
    Card(rank='3', suit='clubs')
    Card(rank='2', suit='clubs')
    Card(rank='A', suit='diamonds')
    Card(rank='K', suit='diamonds')
    Card(rank='Q', suit='diamonds')
    Card(rank='J', suit='diamonds')
    Card(rank='10', suit='diamonds')
    Card(rank='9', suit='diamonds')
    Card(rank='8', suit='diamonds')
    Card(rank='7', suit='diamonds')
    Card(rank='6', suit='diamonds')
    Card(rank='5', suit='diamonds')
    Card(rank='4', suit='diamonds')
    Card(rank='3', suit='diamonds')
    Card(rank='2', suit='diamonds')
    Card(rank='A', suit='spades')
    Card(rank='K', suit='spades')
    Card(rank='Q', suit='spades')
    Card(rank='J', suit='spades')
    Card(rank='10', suit='spades')
    Card(rank='9', suit='spades')
    Card(rank='8', suit='spades')
    Card(rank='7', suit='spades')
    Card(rank='6', suit='spades')
    Card(rank='5', suit='spades')
    Card(rank='4', suit='spades')
    Card(rank='3', suit='spades')
    Card(rank='2', suit='spades')
    

迭代通常是隐式的，譬如说一个集合类型没有实现__contains__方法，那么 in 运算符就会按顺序做一次迭代搜索。于是，in 运算符可以用在我们的 FrenchDeck 类上，因为它是可迭代的


```python
Card('Q', 'hearts') in deck
```




    True




```python
# 自定义排序函数
suit_values = dict(spades=3, hearts=2, diamonds=1, clubs=0)
def spades_high(card):
    rank_value = FrenchDeck.ranks.index(card.rank)
    return rank_value * len(suit_values)+suit_values[card.suit]
  
for card in sorted(deck, key=spades_high):
  print(card)
```

    Card(rank='2', suit='clubs')
    Card(rank='2', suit='diamonds')
    Card(rank='2', suit='hearts')
    Card(rank='2', suit='spades')
    Card(rank='3', suit='clubs')
    Card(rank='3', suit='diamonds')
    Card(rank='3', suit='hearts')
    Card(rank='3', suit='spades')
    Card(rank='4', suit='clubs')
    Card(rank='4', suit='diamonds')
    Card(rank='4', suit='hearts')
    Card(rank='4', suit='spades')
    Card(rank='5', suit='clubs')
    Card(rank='5', suit='diamonds')
    Card(rank='5', suit='hearts')
    Card(rank='5', suit='spades')
    Card(rank='6', suit='clubs')
    Card(rank='6', suit='diamonds')
    Card(rank='6', suit='hearts')
    Card(rank='6', suit='spades')
    Card(rank='7', suit='clubs')
    Card(rank='7', suit='diamonds')
    Card(rank='7', suit='hearts')
    Card(rank='7', suit='spades')
    Card(rank='8', suit='clubs')
    Card(rank='8', suit='diamonds')
    Card(rank='8', suit='hearts')
    Card(rank='8', suit='spades')
    Card(rank='9', suit='clubs')
    Card(rank='9', suit='diamonds')
    Card(rank='9', suit='hearts')
    Card(rank='9', suit='spades')
    Card(rank='10', suit='clubs')
    Card(rank='10', suit='diamonds')
    Card(rank='10', suit='hearts')
    Card(rank='10', suit='spades')
    Card(rank='J', suit='clubs')
    Card(rank='J', suit='diamonds')
    Card(rank='J', suit='hearts')
    Card(rank='J', suit='spades')
    Card(rank='Q', suit='clubs')
    Card(rank='Q', suit='diamonds')
    Card(rank='Q', suit='hearts')
    Card(rank='Q', suit='spades')
    Card(rank='K', suit='clubs')
    Card(rank='K', suit='diamonds')
    Card(rank='K', suit='hearts')
    Card(rank='K', suit='spades')
    Card(rank='A', suit='clubs')
    Card(rank='A', suit='diamonds')
    Card(rank='A', suit='hearts')
    Card(rank='A', suit='spades')
    

## 如何使用特殊方法

- 没有`my_object.__len__（　）`这种写法，而应该使用`len(my_object)`，Python 会自己去调用其中由你实现的`__len__`方法。
- 如果是 Python 内置的类型，比如列表（list）、字符串（str）、字节序列（bytearray）等，那么 CPython 会抄个近路，`__len__`实际上会直接返回 PyVarObject 里的 ob_size 属性。PyVarObject 是表示内存中长度可变的内置对象的 C 语言结构体。直接读取这个值比调用一个方法要快很多。
- 通常你的代码无需直接使用特殊方法。除非有大量的元编程存在，直接调用特殊方法的频率应该远远低于你去实现它们的次数。唯一的例外可能是`__init__`方法，你的代码里可能经常会用到它，目的是在你自己的子类的`__init__`方法中调用超类的构造器。
- 通过内置的函数（例如 len、iter、str，等等）来使用特殊方法是最好的选择。这些内置函数不仅会调用特殊方法，通常还提供额外的好处，而且对于内置的类来说，它们的速度更快。
- 不要自己想当然地随意添加特殊方法，比如__foo__之类的，因为虽然现在这个名字没有被 Python 内部使用，以后就不一定了。

**模拟一个向量类**


```python
from math import hypot
class Vector:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y
    def __repr__(self):
        return 'Vector(%r,%r)'%(self.x, self.y)
    def __abs__(self):
        return hypot(self.x, self.y)
    def __bool__(self):
        return bool(abs(self))
    def __add__(self, other):
        x = self.x+other.x
        y = self.y+other.y
        return Vector(x, y)
    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)
```

值得注意的是：

- 交互式控制台和调试程序（debugger）用 repr 函数来获取字符串表示形式
- `__repr__`和`__str__`的区别在于，后者是在 str（　）函数被使用，或是在用 print 函数打印一个对象的时候才被调用的，并且它返回的字符串对终端用户更友好。
- 如果你只想实现这两个特殊方法中的一个，`__repr__`是更好的选择，因为如果一个对象没有`__str__`函数，而 Python 又需要调用它的时候，解释器会用`__repr__`作为替代。
- 通过`__add__`和`__mul__`，为向量类带来了`+`和`*`这两个算术运算符。

> 这两个方法的返回值都是新创建的向量对象，被操作的两个向量（self 或 other）还是原封不动，代码里只是读取了它们的值而已。中缀运算符的基本原则就是不改变操作对象，而是产出一个新的值。

- 默认情况下，我们自己定义的类的实例总被认为是真的，除非这个类对`__bool__`或者`__len__`函数有自己的实现。`bool(x)`的背后是调用 x.`__bool__（　）`的结果；如果不存在`__bool__`方法，那么`bool(x)`会尝试调用`x.__len__（　）`。若返回 0，则 bool 会返回 False；否则返回 True。

Python 的内置魔法方法可以按照其功能大致分类如下：

| 分类 | 魔法方法 |
| --- | --- |
| 基本方法 | `__new__`, `__init__`, `__del__`, `__repr__`, `__str__` |
| 算术运算符 | `__add__`, `__sub__`, `__mul__`, `__truediv__`, `__floordiv__`, `__mod__`, `__divmod__`, `__pow__`, `__lshift__`, `__rshift__`, `__and__`, `__xor__`, `__or__` |
| 反向算术运算符 | `__radd__`, `__rsub__`, `__rmul__`, `__rtruediv__`, `__rfloordiv__`, `__rmod__`, `__rdivmod__`, `__rpow__`, `__rlshift__`, `__rrshift__`, `__rand__`, `__rxor__`, `__ror__` |
| 扩展的赋值运算符 | `__iadd__`, `__isub__`, `__imul__`, `__itruediv__`, `__ifloordiv__`, `__imod__`, `__ipow__`, `__ilshift__`, `__irshift__`, `__iand__`, `__ixor__`, `__ior__` |
| 一元运算符 | `__neg__`, `__pos__`, `__abs__`, `__invert__` |
| 属性访问 | `__getattr__`, `__getattribute__`, `__setattr__`, `__delattr__`, `__dir__` |
| 描述符 | `__get__`, `__set__`, `__delete__` |
| 容器类型 | `__len__`, `__getitem__`, `__setitem__`, `__delitem__`, `__iter__`, `__reversed__`, `__contains__` |
| 上下文管理 | `__enter__`, `__exit__` |
| 对象比较 | `__eq__`, `__ne__`, `__lt__`, `__le__`, `__gt__`, `__ge__` |
| 类型转换 | `__int__`, `__float__`, `__bool__`, `__complex__`, `__bytes__`, `__str__` |
| 其他 | `__call__`, `__hash__`, `__format__`, `__sizeof__` |

以上都是 Python 中常见的一些内置魔法方法，它们用于实现特定的类行为。

> 当交换两个操作数的位置时，就会调用反向运算符`（b * a 而不是 a * b）`。增量赋值运算符则是一种把中缀运算符变成赋值运算的捷径`（a=a * b 就变成了 a *=b）`。

## 为什么 Len 不是普通方法

如果 x 是一个内置类型的实例，那么 len(x)的速度会非常快。背后的原因是 CPython 会直接从一个 C 结构体里读取对象的长度，完全不会调用任何方法。获取一个集合中元素的数量是一个很常见的操作，在 str、list、memoryview 等类型上，这个操作必须高效。

换句话说，len 之所以不是一个普通方法，是为了让 Python 自带的数据结构可以走后门，abs 也是同理。

也印证了“Python 之禅”中的另外一句话：“不能让特例特殊到开始破坏既定规则。”
