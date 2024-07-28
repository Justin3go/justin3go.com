# 使用future处理并发

> 此笔记记录于《流畅的python》，大部分为其中的摘要，少部分为笔者自己的理解；笔记为jupyter转的markdown，原始版jupyter笔记在[这个仓库](https://github.com/Justin3go/fluent-python-note)

> 抨击线程的往往是系统程序员，他们考虑的使用场景对一般的应用程序员来说，也许一生都不会遇到……应用程序员遇到的使用场景，99%的情况下只需知道如何派生一堆独立的线程，然后用队列收集结果。

## 依序下载


```python
import os
import time
import sys
import requests
POP20_CC = ('CN IN US ID BR PK NG BD RU JP '
            'MX PH VN ET EG DE IR TR CD FR').split()
BASE_URL = 'http://flupy.org/data/flags'
DEST_DIR = 'downloads/'


def save_flag(img, filename):
    path = os.path.join(DEST_DIR, filename)
    with open(path, 'wb') as fp:
        fp.write(img)


def get_flag(cc):
    url = '{}/{cc}/{cc}.gif'.format(BASE_URL, cc=cc.lower())
    resp = requests.get(url)
    return resp.content


def show(text):
    print(text, end=' ')
    sys.stdout.flush()


def download_many(cc_list):
    for cc in sorted(cc_list):
        image = get_flag(cc)
        show(cc)
        save_flag(image, cc.lower()+'.gif')
    return len(cc_list)


def main(download_many):
    t0 = time.time()
    count = download_many(POP20_CC)
    elapsed = time.time()-t0
    msg = '\n{} flags downloaded in {:.2f}s'
    print(msg.format(count, elapsed))


if __name__ == '__main__':
    main(download_many)
```

## 多线程下载


```python
from concurrent import futures

MAX_WORKERS = 20


def download_one(cc):
    image = get_flag(cc)
    show(cc)
    save_flag(image, cc.lower()+'.gif')
    return cc


def download_many(cc_list):
    workers = min(MAX_WORKERS, len(cc_list))
    with futures.ThreadPoolExecutor(workers) as executor:
        res = executor.map(download_one, sorted(cc_list))
    return len(list(res))


if __name__ == '__main__':
    main(download_many)
```

是的，Python中的`Future`对象与JavaScript中的`Promise`在概念上是相似的。它们都用于处理异步操作，允许程序继续执行而不必等待操作完成。这两种机制都提供了一种方式来访问异步操作的结果，一旦操作完成，无论是成功还是失败。

- **Python的`Future`**：在`concurrent.futures`模块中，`Future`对象代表异步执行的操作，提供了方法来查询操作的状态（例如，判断操作是否完成）和结果（成功的结果或抛出的异常）。开发者通常不直接创建`Future`对象，而是由并发执行机制（如`ThreadPoolExecutor`或`ProcessPoolExecutor`）创建并返回`Future`对象。

- **JavaScript的`Promise`**：`Promise`是一个代表了异步操作最终完成或失败的对象。它允许你为异步操作的成功结果或失败原因分别指定处理方法。`Promise`有三种状态：pending（等待中）、fulfilled（已成功）和rejected（已失败）。通过`.then()`、`.catch()`和`.finally()`方法可以设置当`Promise`解决或拒绝时应该执行的操作。

尽管两者在概念和用途上相似，但它们的具体实现和使用的语言环境不同。Python的`Future`通常用于多线程和多进程的并发编程，而JavaScript的`Promise`广泛用于处理异步Web API调用、文件操作等异步编程场景。

## 阻塞型I/O和GIL

CPython解释器本身就不是线程安全的，因此有全局解释器锁（GIL），一次只允许使用一个线程执行Python字节码。因此，一个Python进程通常不能同时使用多个CPU核心

编写Python代码时无法控制GIL；不过，执行耗时的任务时，可以使用一个内置的函数或一个使用C语言编写的扩展释放GIL。其实，有个使用C语言编写的Python库能管理GIL，自行启动操作系统线程，利用全部可用的CPU核心。这样做会极大地增加库代码的复杂度，因此大多数库的作者都不这么做。

然而，标准库中所有执行阻塞型`I/O`操作的函数，在等待操作系统返回结果时都会释放GIL。这意味着在Python语言这个层次上可以使用多线程，而I/O密集型Python程序能从中受益：一个Python线程等待网络响应时，阻塞型I/O函数会释放GIL，再运行一个线程。

因此David Beazley才说：“Python线程毫无作用。”

Python标准库中的所有阻塞型`I/O`函数都会释放GIL，允许其他线程运行。`time.sleep（　）`函数也会释放GIL。因此，尽管有GIL，Python线程还是能在`I/O`密集型应用中发挥作用。

面简单说明如何在CPU密集型作业中使用`concurrent.futures`模块轻松绕开GIL。

## 使用concurrent.futures模块启动进程

只需改动上面例子中的这几行


```python
def download_many(cc_list):
    workers = min(MAX_WORKERS, len(cc_list))
    with futures.ThreadPoolExecutor(workers) as executor:
      pass
```


```python
def download_many(cc_list):
    with futures.ProcessPoolExecutor() as executor:
      pass
```

> `ThreadPoolExecutor.__init__`方法需要max_workers参数，指定线程池中线程的数量。在ProcessPoolExecutor类中，那个参数是可选的，而且大多数情况下不使用——默认值是`os.cpu_count（　）`函数返回的CPU数量。这样处理说得通，因为对CPU密集型的处理来说，不可能要求使用超过CPU数量的职程。而对`I/O`密集型处理来说，可以在一个ThreadPoolExecutor实例中使用10个、100个或1000个线程；最佳线程数取决于做的是什么事，以及可用内存有多少，因此要仔细测试才能找到最佳的线程数。
