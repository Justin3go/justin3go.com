# 使用 asyncio 包处理并发

> 此笔记记录于《流畅的 python》，大部分为其中的摘要，少部分为笔者自己的理解；笔记为 jupyter 转的 markdown，原始版 jupyter 笔记在[这个仓库](https://github.com/Justin3go/fluent-python-note)

## 线程与协程对比

通过线程以动画形式显示文本式旋转指针:


```python
import threading
import itertools
import time
import sys


class Signal:
    go = True


def spin(msg, signal):
    write, flush = sys.stdout.write, sys.stdout.flush
    for char in itertools.cycle('|/-\\'):
        status = char+' '+msg
        write(status)
        flush()
        write('\x08' * len(status))
        time.sleep(.1)
        if not signal.go:
            break
    write(' ' * len(status)+'\x08' * len(status))


def slow_function():
    # 假装等待 I/O 一段时间
    time.sleep(3)
    return 42


def supervisor():
    signal = Signal()
    spinner = threading.Thread(target=spin,
                               args=('thinking!', signal))
    print('spinner object:', spinner)
    spinner.start()
    result = slow_function()
    signal.go = False
    spinner.join()
    return result


def main():
    result = supervisor()
    print('Answer:', result)


if __name__ == '__main__':
    main()
```

    spinner object: <Thread(Thread-5 (spin), initial)>
    | thinking/ thinking- thinking\ thinking| thinking/ thinking- thinking\ thinking| thinking/ thinking- thinking\ thinking| thinking/ thinking- thinking\ thinking| thinking/ thinking- thinking\ thinking| thinking/ thinking- thinking\ thinking| thinking/ thinking- thinking\ thinking          Answer: 42
    

通过协程以动画形式显示文本式旋转指针（3.7 语法已经更新）


```python
import asyncio
import itertools
import sys


async def spin(msg):  # 使用 async 定义协程
    write, flush = sys.stdout.write, sys.stdout.flush
    for char in itertools.cycle('|/-\\'):
        status = char + ' ' + msg
        write(status)
        flush()
        write('\x08' * len(status))
        try:
            await asyncio.sleep(.1)  # 使用 await
        except asyncio.CancelledError:
            break
    write(' ' * len(status) + '\x08' * len(status))


async def slow_function():  # 使用 async 定义协程
    # 假装等待 I/O 一段时间
    await asyncio.sleep(3)  # 使用 await
    return 42


async def supervisor():  # 使用 async 定义协程
    spinner = asyncio.create_task(spin('thinking!'))  # 使用 asyncio.create_task()
    print('spinner object:', spinner)
    result = await slow_function()  # 使用 await
    spinner.cancel()
    return result


def main():
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(supervisor())
    loop.close()
    print('Answer:', result)


if __name__ == '__main__':
    main()
```

略略略...
