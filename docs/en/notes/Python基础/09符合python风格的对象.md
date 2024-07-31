# 符合 python 风格的对象

> 此笔记记录于《流畅的 python》，大部分为其中的摘要，少部分为笔者自己的理解；笔记为 jupyter 转的 markdown，原始版 jupyter 笔记在[这个仓库](https://github.com/Justin3go/fluent-python-note)

绝对不要使用两个前导下划线，这是很烦人的自私行为。

得益于 Python 数据模型，自定义类型的行为可以像内置类型那样自然。实现如此自然的行为，靠的不是继承，而是**鸭子类型（duck typing）**：我们只需按照预定行为实现对象所需的方法即可。

## 对象表示形式

每门面向对象的语言至少都有一种获取对象的字符串表示形式的标准方式。Python 提供了两种方式。

- `repr()`：以便于开发者理解的方式返回对象的字符串表示形式。
- `str()`：以便于用户理解的方式返回对象的字符串表示形式。

还会用到另外两个特殊方法：`__bytes__`和`__format`:

- `__bytes__`：`bytes()`函数调用它获取对象的字节序列表示形式。
- `__format__`：内置的`format()`函数和`str.format()`方法调用它获取对象的字符串格式。


> 记住，在 Python 3 中，`__repr__`、`__str__`和`__format__`都必须返回 Unicode 字符串（str 类型）。只有`__bytes__`方法应该返回字节序列（bytes 类型）。

## 再谈向量类


```python
from array import array
import math


class Vector2d:
    typecode = 'd'

    def __init__(self, x, y):
        self.x = float(x)
        self.y = float(y)

    def __iter__(self):
        return (i for i in (self.x, self.y))

    def __repr__(self):
        class_name = type(self).__name__
        return '{}({!r}, {!r})'.format(class_name, *self)

    def __str__(self):
        return str(tuple(self))

    def __bytes__(self):
        return (bytes([ord(self.typecode)]) +
                bytes(array(self.typecode, self)))

    def __eq__(self, other):
        return tuple(self) == tuple(other)

    def __abs__(self):
        return math.hypot(self.x, self.y)

    def __bool__(self):
        return bool(abs(self))
```

## 备选构造方法

我们可以把 Vector2d 实例转换成字节序列了；同理，也应该能从字节序列转换成 Vector2d 实例。


```python
@classmethod
def frombytes(cls, octets): # 不传入 self 参数，相反通过 cls 传入类本身
    typecode = chr(octets[0]) # 从第一个字节中读取 typecode
    memv = memoryview(octets[1:]).cast(typecode) # 使用传入的 octets 字节序列创建一个 memoryview，然后使用 typecode 转换
    return cls(*memv) # 拆包转换后的 memoryview，得到构造方法所需的一对参数
```

## classmethod 与 staticmethod

- 先来看 classmethod。上例展示了它的用法：定义操作类，而不是操作实例的方法。classmethod 改变了调用方法的方式，因此类方法的第一个参数是类本身，而不是实例。classmethod 最常见的用途是定义备选构造方法，
- staticmethod 装饰器也会改变方法的调用方式，但是第一个参数不是特殊的值。其实，静态方法就是普通的函数，只是碰巧在类的定义体中，而不是在模块层定义。


```python
class Demo:
    @classmethod
    def klassmeth(*args):
        return args

    @staticmethod
    def statmeth(*args):
        return args
```


```python
Demo.klassmeth() # 不管怎样调用 Demo.klassmeth，它的第一个参数始终是 Demo 类
```




    (__main__.Demo,)




```python
Demo.klassmeth('spam') # 不管怎样调用 Demo.klassmeth，它的第一个参数始终是 Demo 类
```




    (__main__.Demo, 'spam')




```python
Demo.statmeth('spam') # Demo.statmeth 的行为与普通的函数相似。
```




    ('spam',)



> classmethod 装饰器非常有用，但是我从未见过不得不用 staticmethod 的情况。如果想定义不需要与类交互的函数，那么在模块中定义就好了。有时，函数虽然从不处理类，但是函数的功能与类紧密相关，因此想把它放在近处。即便如此，在同一模块中的类前面或后面定义函数也就行了

## 格式化显示

内置的`format（　）`函数和`str.format（　）`方法把各个类型的格式化方式委托给相应的`.__format__(format_spec)`方法。`format_spec`是格式说明符，它是：`format(my_obj, format_spec)`的第二个参数，或者`str.format（　）`方法的格式字符串，`{}`里代换字段中冒号后面的部分


```python
br1 = 1/2.43
br1
```




    0.4115226337448559




```python
format(br1, '0.4f')
```




    '0.4115'




```python
'1 BRL = {rate:0.2f} USD'.format(rate=br1)
```




    '1 BRL = 0.41 USD'




```python
format(42, 'b') # 二进制
```




    '101010'




```python
format(2/3, '.1%') # 百分比
```




    '66.7%'




```python
from datetime import datetime
now = datetime.now()
format(now, '%H:%M:%S')
```




    '17:27:40'




```python
"It's now {:%I:%M %p}".format(now)
```




    "It's now 05:27 PM"



如果类没有定义`__format__`方法，从 object 继承的方法会返回 str(my_object)。

## 可散列的 Vector2d

为了把 Vector2d 实例变成可散列的，必须使用`__hash__`方法（还需要`__eq__`方法，前面已经实现了）


```python
class Vector2d:
    typecode = 'd'

    def __init__(self, x, y):
        self.__x = float(x)
        self.__y = float(y)

    @property
    def x(self):
        return self.__x

    @property
    def y(self):
        return self.__y

    def __iter__(self):
        return (i for i in (self.x, self.y))
    # 下面是其他方法（排版需要，省略了）
    
    def __hash__(self):
        return hash(self.x) ^ hash(self.y)
```


```python
v1 = Vector2d(3, 4)
v2 = Vector2d(3.1, 4.2)
hash(v1), hash(v2)
```




    (7, 384307168202284039)




```python
set([v1, v2])
```




    {<__main__.Vector2d at 0x19fa54c9480>, <__main__.Vector2d at 0x19fa54c96c0>}



> 要想创建可散列的类型，不一定要实现特性，也不一定要保护实例属性。只需正确地实现`__hash__`和`__eq__`方法即可。但是，实例的散列值绝不应该变化，因此我们借机提到了只读特性。

## python 的私有属性和受保护属性

有人编写了一个名为 Dog 的类，这个类的内部用到了 mood 实例属性，但是没有将其开放。现在，你创建了 Dog 类的子类：Beagle。如果你在毫不知情的情况下又创建了名为 mood 的实例属性，那么在继承的方法中就会把 Dog 类的 mood 属性覆盖掉。这是个难以调试的问题。

为了避免这种情况，如果以`__mood`的形式（两个前导下划线，尾部没有或最多有一个下划线）命名实例属性，Python 会把属性名存入实例的`__dict__`属性中，而且会在前面加上一个下划线和类名。因此，对 Dog 类来说，`__mood`会变成`_Dog__mood`；对 Beagle 类来说，会变成`_Beagle__mood`。这个语言特性叫**名称改写（name mangling）**。

名称改写是一种安全措施，不能保证万无一失：它的目的是避免意外访问，不能防止故意做错事。只要知道改写私有属性名的机制，任何人都能直接读取私有属性——这对调试和序列化倒是有用。此外，只要编写`v1._Vector__x=7`这样的代码，就能轻松地为 Vector2d 实例的私有分量直接赋值。

*不是所有 Python 程序员都喜欢名称改写功能，也不是所有人都喜欢`self.__x`这种不对称的名称。有些人不喜欢这种句法，他们约定使用一个下划线前缀编写“受保护”的属性（如`self._x`）。批评使用两个下划线这种改写机制的人认为，应该使用命名约定来避免意外覆盖属性。*

*绝对不要使用两个前导下划线，这是很烦人的自私行为。如果担心名称冲突，应该明确使用一种名称改写方式（如`_MyThing_blahblah`）。这其实与使用双下划线一样，不过自己定的规则比双下划线易于理解。*

## 使用``__slots__``类属性节省空间

默认情况下，Python 在各个实例中名为`__dict__`的字典里存储实例属性。为了使用底层的散列表提升访问速度，字典会消耗大量内存。如果要处理数百万个属性不多的实例，通过`__slots__`类属性，能节省大量内存，方法是让解释器在元组中存储实例属性，而不用字典。


```python
# 在类中定义__slots__属性的目的是告诉解释器：“这个类中的所有实例属性都在这儿了！”
class Vector2d:
    __slots__ = ('__x', '__y')
    typecode = 'd'
    #下面是各个方法（因排版需要而省略了）
```

注意：

- 每个子类都要定义`__slots__`属性，因为解释器会忽略继承的`__slots__`属性。
- 实例只能拥有`__slots__`中列出的属性，除非把`'__dict__'`加入`__slots__`中（这样做就失去了节省内存的功效）。
- 如果不把`'__weakref__'`加入`__slots__`，实例就不能作为弱引用的目标。

所以，你应该考虑当前场景，权衡之下再决定是否使用`__slots__`。

## 覆盖类属性

Python 有个很独特的特性：类属性可用于为实例属性提供默认值。
