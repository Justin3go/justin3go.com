# 上下文管理和 else 块

> 此笔记记录于《流畅的 python》，大部分为其中的摘要，少部分为笔者自己的理解；笔记为 jupyter 转的 markdown，原始版 jupyter 笔记在[这个仓库](https://github.com/Justin3go/fluent-python-note)

## 先做这个，再做那个：if 语句之外的 else 块

`for/else`、`while/else`和`try/else`的语义关系紧密，不过与`if/else`差别很大。

- `for`: 仅当 for 循环运行完毕时（即 for 循环没有被 break 语句中止）才运行 else 块。
- `while`: 仅当 while 循环因为条件为假值而退出时（即 while 循环没有被 break 语句中止）才运行 else 块。
- `try`: 仅当 try 块中没有异常抛出时才运行 else 块。官方文档还指出：“else 子句抛出的异常不会由前面的 except 子句处理。”

> 我觉得除了 if 语句之外，其他语句选择使用 else 关键字是个错误。else 蕴含着“排他性”这层意思，例如“要么运行这个循环，要么做那件事”。可是，在循环中，else 的语义恰好相反：“运行这个循环，然后做那件事。”因此，使用 then 关键字更好。then 在 try 语句的上下文中也说得通：“尝试运行这个，然后做那件事。”可是，添加新关键字属于语言的重大变化，而 Guido 唯恐避之不及。


```python
my_list = [1, 2, 3, 4, 5]

for item in my_list:
    if item == 'banana':
        break
else:
    raise ValueError('No banana flavor found!')
  
print('finished search!')
```


    ---------------------------------------------------------------------------

    ValueError                                Traceback (most recent call last)

    Cell In[4], line 7
          5         break
          6 else:
    ----> 7     raise ValueError('No banana flavor found!')
          9 print('finished search!')
    

    ValueError: No banana flavor found!



```python
my_list = [1, 2, 3, 'banana', 5]

for item in my_list:
    if item == 'banana':
        break
else:
    raise ValueError('No banana flavor found!')
  
print('finished search!')
```

    finished search!
    

两种风格：

- EAFP：取得原谅比获得许可容易（easier to ask for forgiveness than permission）。这是一种常见的 Python 编程风格，先假定存在有效的键或属性，如果假定不成立，那么捕获异常。这种风格简单明快，特点是代码中有很多 try 和 except 语句。与其他很多语言一样（如 C 语言），这种风格的对立面是 LBYL 风格。
- LBYL：LBYL 三思而后行（look before you leap）。这种编程风格在调用函数或查找属性或键之前显式测试前提条件。与 EAFP 风格相反，这种风格的特点是代码中有很多 if 语句。在多线程环境中，LBYL 风格可能会在“检查”和“行事”的空当引入条件竞争。例如，对 if key in mapping: return mapping[key]这段代码来说，如果在测试之后，但在查找之前，另一个线程从映射中删除了那个键，那么这段代码就会失败。这个问题可以使用锁或者 EAFP 风格解决。

## 上下文管理与 with 块

上下文管理器对象存在的目的是管理 with 语句，就像迭代器的存在是为了管理 for 语句一样。

with 语句的目的是简化`try/finally`模式。这种模式用于保证一段代码运行完毕后执行某项操作，即便那段代码由于异常、return 语句或`sys.exit（　）`调用而中止，也会执行指定的操作。finally 子句中的代码通常用于释放重要的资源，或者还原临时变更的状态。

上下文管理器协议包含`__enter__`和`__exit__`两个方法。with 语句开始运行时，会在上下文管理器对象上调用`__enter__`方法。with 语句运行结束后，会在上下文管理器对象上调用`__exit__`方法，以此扮演 finally 子句的角色。

## contextlib 模块中的实用工具

| 实用工具           | 描述                                                         |
|------------------|------------------------------------------------------------|
| `contextmanager` | 一个装饰器，将一个生成器函数变为上下文管理器。                        |
| `closing`        | 一个帮助函数，通过调用对象的`close()`方法来自动关闭资源的上下文管理器。  |
| `redirect_stdout`| 一个上下文管理器，用于将`sys.stdout`的输出重定向到指定的文件或文件类对象。  |
| `redirect_stderr`| 一个上下文管理器，用于将`sys.stderr`的输出重定向到指定的文件或文件类对象。  |
| `suppress`       | 一个上下文管理器，用来暂时抑制指定的异常。                           |
| `ExitStack`      | 一个上下文管理器，用于动态管理其他上下文管理器和清理函数的入栈和出栈。      |
| `nullcontext`    | 一个上下文管理器，提供一个无操作的上下文环境。                         |



```python
import contextlib


@contextlib.contextmanager
def looking_glass():
    import sys
    original_write = sys.stdout.write

    def reverse_write(text):
        original_write(text[::-1])
    sys.stdout.write = reverse_write
    yield 'JABBERWOCKY'
    sys.stdout.write = original_write
```
