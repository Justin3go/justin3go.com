# Django 进阶学习笔记

## admin

### 注册自定义模型类

> 若要自己定义地模型类也能在/admin 后台管理界面中显示和管理，需要将自己的类注册到后台哦管理界面

```python
# admin.py
from .models import Book
admin.site.register(自定义模型类)
```

模型类的名字是你定义模型的\__str__返回值

### 模型管理器类

作用：为后台管理界面添加便于操作的新功能

说明：后台管理器类须继承自 django.contrib.admin 里面的 ModelAdmin 类

```python
from django.contrib import admin
from .models import *

class XXXManager(admin.ModelAdmin):
    ''''''
    pass

admin.site.register(YYY, XXXManager)  # 绑定 YYY 模型
# 1.这里也注册了模型类
# 2.绑定了管理类
```

字段：

- list_display = ['id', 'title', 'content', ......] : 作用是把该域内的字段也显示在管理界面中，否则管理界面中就只会显示模型的类名

  ![image-20211101215931433](https://oss.justin3go.com/blogs/image-20211101215931433-16357751922101.png)

  > verpose_name 就是控制这上面的字段名的

- list_display_links = ['title'] : 作用就是把超链接放在你指定的字段名上，这里造成的变化就是把上面 id 列的蓝色转移到书名列使其变为蓝色

- list_filter = ['pub'] : 作用就是对某个字段进行过滤显示的作用

- search_fields = ['title'] : 以某个字段添加搜索框，模糊查询

- list_editable = ['price'] : 添加可在列表编辑的字段

<img src="https://oss.justin3go.com/blogs/image-20211101220946145.png" alt="image-20211101220946145" style="zoom: 50%;" />

## ORM 查询系统

- all()

- values('列 1', ‘列 2’)

  查询部分列的数据返回

- filter()

  - ```python
    MyModel.objects.filter(属性 1=值 1, 属性 2=只)
    ```

  - 作用：返回包含此条件的全部数据集

  - 当多个属性在一起时默认为'与'关系

- exclude(): 不包含

- 条件查询--查询谓词

  - __exact：等值匹配，一般不加，默认就为这个，匹配 null 时会加

  - __contains：包含指定值

  - __startswith:

  - __endswith:

  - __gt：大于

  - __gte：大于等于

  - __lt：小于

  - __lte：小于等于

  - __in：查找数据是否在指定范围内

    ```python
    Auther.objects.filter(country__in=['中国', '日本', '韩国'])
    ```

  - __range：查找数据是否在指定的区间范围内

    ```python
    Auther.objects.filter(age__range=(35,50))
    ```

- F 对象

  - 一个 F 对象代表数据库中某条记录的字段的信息

  - 通常是对数据库中的字段值在不获取的情况下进行操作用于类属性之间的比较

  - ```python
    from django.db,models import F
    F('列名')
    ```

  - ```python
    # 示例：更新 Book 实例中所有的零售价涨 10 元
    Book.objects.all().update(market_price=F('market_pice')+10)
    
    # 以上做法好于如下代码
    books = Book.objects.all()
    for book in books:
        book.market_price=book.marget_price+10
        book.save()
    ```

    上面的做法相当于+=10,而下面的做法就是把这个值实实在在地查出来之后加上 10，再把这个最终的值放进去

    **解决并发计数的问题**

    比如点赞数的更新就必须是 F 对象操作，而不能将数据库中的值取出来，否则可能造成多端不同步的情况

- Q 对象

  - 当在获取查询结果集，使用复杂的逻辑或、逻辑非，与非(~&)等操作时可以借助 Q 对象进行操作

  - 如：想找出定价低于 20 元或清华大学出版社的全部书，可以写成

    ```python
    Book.objects.filter(Q(price__lt=20)|Q(pub="清华大学出版社"))
    ```

- 聚合函数

  - ```python
    from django.db.models import *
    ```

  - Sum, Avg, Count, Max, Min

  - ```python
    MyModel.objects.agregate(结果变量名=聚合函数('列'))
    return {"结果变量名": 值}
    ```

  - 在后面加 filter 就等于 having

- 原生数据库操作

  ```python
  Mymodel.bjects.raw(sql 语句, 拼接参数)
  books = models.Book.objects.raw('select * from bookstore_book')
  ```

  使用原生数据库操作时需要小心 SQL 注入

  定义：用户通过数据上传，将恶意的 sql 语句提交给服务器，从而达到攻击效果

  案例 1：用户在搜索好友的表单框里输入‘1 or 1=1’

  ```python
  s1 = Book.objects.raw('select * from bookstore_book where id=%s'%('1 or 1=1'))
  ```

  攻击结果：查询出所有用户

  解决办法：使用拼接参数

  cursor


## Cookies 与 Session

### cookies 特点

- cookies 在浏览器上是以键值对的形式进行存储的，键和值都是以 ASCII 字符串的形式存储（不能是中文字符）
- 存储的数据带有生命周期
- cookies 中的数据是按域存储隔离的，不同的域之间无法访问
- cookies 内部的数据会在每次访问此网址时都会携带到服务器端，如果 cookies 过大会降低响应速度

### 存储

```python
HttpResponse.set_cookie(key, value="", max_age=None, expire=None)
'''
key: cookies 的名字
value: 值
max_age: 存活时间，秒为单位
expires: 具体过期时间
注：当不指定后两个参数的时候，关闭浏览器时此数据失效
'''
```

### 删除

```python
HttpResponse.delete_cookie(key)
# 删除指定 key 的 cookie,如果 key 不存在则什么也不发生
```

### 获取

```python
value = request.COOKIES.get('cookies 名', '默认值')
# 其中 request.COOKIES 返回的时字典
```

### Session

原因：数据都存在了浏览器端，每次请求都要传一大堆，同时也不安全

解决：浏览器端仅仅保存一段身份验证码，其他的数据全部存在服务器端

session 是在服务器上开辟的一段空间用于保留浏览器和服务器交互时的重要数据

实现方式：

- 使用 sesion 需要在浏览器客户端启动 cooke，且在 cookie 中存储 sessionId
- 每个客户端都可以在服务器端有一个独立的 session
- 注意：不同的请求者之间不会共享这个数据，与请求者一一对应

### 配置

```python
# 默认是开启的
INSTALLED_APPS = [
    # 启动 sessions 应用
    'django.contrib.sessions',
]

MIDDLEWARE = [
    'django.contrib.sessions.middleware.SessionMiddleware'
]
```

### 使用

和字典一样

- 保存 session 的值到服务器

  ```python
  request.session['KEY'] = VALUE
  ```

- 获取 session 的值

  ```python
  value = request.session['KEY']
  value = request.session['KEY',默认值]
  ```

- 删除 session

  ```python
  del request.session['KEY']
  ```

### 字段配置项

```python
SESSION_COOKIE_AGE = 60*60*24*7*2
# 指定 sessionid 在 cookies 中的保存时长（默认是两周）
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
# 设置在关闭浏览器时，session 就失效
```

### 问题

- django_session 表是单表设计；且该表数据量持续增持【浏览器故意删掉 sessionid&过期数据未删除】
- 可以每晚执行 python3 manage.py clearsessions【删除已过期的 session 数据】

## 返回 CSV 文件与分页

### 返回 csv 文件下载

```python
import csv
with open('eggs.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerrow(['a', 'b', 'c'])
```

在网站中，要实现下载 csv 文件，**需注意**：

- 响应 Content-Type 类型需修改为 text/csv。着告诉浏览器是 csv 文件，而不是 HTML 文件
- 响应会获得额外的 Content-Disposition 标头，其中包含 CSV 文件的名称。它将被浏览器用于开启’另存为‘对话框

```python
import csv
from django.http import HttpResponse

def some_view(request):
    # Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="somefilename.csv"'},
    )

    writer = csv.writer(response)
    writer.writerow(['First row', 'Foo', 'Bar', 'Baz'])
    writer.writerow(['Second row', 'A', 'B', 'C', '"Testing"', "Here's a quote"])

    return response
```

### 分页

```python
class Paginator(object_list, per_page, orphans=0, allow_empty_first_page=True)
'''
Paginator.object_list
必要的。一个列表、元组、QuerySet 或其他具有 count() 或 __len__() 方法的可切片对象。为了实现一致的分页，QuerySet 应该是有序的，例如使用 order_by() 子句或使用模型上的默认 ordering。

对大型 QuerySet 进行分页的性能问题

如果你使用的 QuerySet 有非常多的项目，在某些数据库上请求高页数可能会很慢，因为产生的 LIMIT ／ OFFSET 查询需要计算 OFFSET 记录的数量，随着页数的增加，需要的时间也就越长。

Paginator.per_page
必要的。一个页面中包含的最大项目数，不包括 orphans（参见下面的 orphans 可选参数）。

Paginator.orphans
可选的。当你不希望最后一页的项目数量很少时，使用这个选项。如果最后一页的项目数量通常小于或等于 orphans，那么这些项目将被添加到前一页（成为最后一页），而不是让这些项目单独留在一页上。例如，如果有 23 个条目，per_page=10，orphans=3，则会有两页；第一页有 10 个条目，第二页（也是最后一页）有 13 个条目。orphans 默认为 0，这意味着页面永远不会合并，最后一页可能只有一个项目。

Paginator.allow_empty_first_page
可选的。是否允许第一页为空。 如果 False 并且 object_list 是空的，则会出现 EmptyPage 错误。
'''
        
```

##### Paginator 属性

- Paginator.count：需要分页数据的对象总数
- Paginator.num_pages：分页后的页面总数
- page_range：从 1 开始的 range 对象，用于记录当前面码数
- per_page：每页数据的个数

##### Paginator 方法

Paginator 对象.page(number)

- 参数 number 为页码信息(从 1 开始)
- 返回当前 number 页对应的页信息
- 如果提供的页码不存在，抛出 InvaildPage 异常

page 对象

- 创建对象：Paginator 对象.page(number)
- 属性：
  - object_list：当前页上所有数据对象的列表
  - number：当前页的序号，从 1 开始
  - paginator：当前 page 对象相关的 Paginator 对象
- 方法
  - Page.has_next()
    如果有下一页，返回 True。
  - Page.has_previous()
    如果有上一页，返回 True。
  - Page.has_other_pages()
    如果有下一页 或 上一页，返回 True。
  - Page.next_page_number()
    返回下一页的页码。如果下一页不存在，则引发 InvalidPage。
  - Page.previous_page_number()
    返回上一页的页码。如果上一页不存在，则引发 InvalidPage。
  - Page.start_index()
    返回页面上第一个对象，相对于分页器列表中所有对象的基于 1 的索引。例如，当对一个有 5 个对象的列表进行分页时，每页有 2 个对象，第二页的 start_index() 将返回 3。
  - Page.end_index()
    返回页面上最后一个对象相对于分页器列表中所有对象的基于 1 的索引。例如，当对一个有 5 个对象的列表进行分页时，每页有 2 个对象，第二页的 end_index() 将返回 4。

> paginator 掌控全局，page 掌控某一页

### 例子

```python
def test_page(request):
    #/test_page/4
    #/test_page?page=1
    page_num = request.GET.get('page', 1)
    all_data = ['a', 'b', 'c', 'd', 'e']
    # 初始化 paginator
    paginator = Paginator.page(int(page_num))
    # 初始化具体页码的 page 对象
    c_page = paginator.page(int(p))
    return render(request, 'test_page.html', locals())
```

```html
<body>
    {% for p in c_page %}
    <p>
    	{{ p }}
    </p>
    {% endfor %}
</body>
有上一页就为超链，否则为文本
{% if c_page.has_previous %}
	<a href="/test_page?page={{ c_page.previous_page_number }}">上一页</a>
{% else %}
	上一页
{% endif %}
当前页为文本，其他页为超链
{% for p_num in paginator.page_range %}
	{% if p_num == c_page.number %}
		{{ p_num }}
	{% else %}
		<a href="/test_page?page={{ p }}">{{ p_num }}</a>
{% endfor %}
同上上
{% if c_page.has_next %}
	<a href="/test_page?page={{ c_page.next_page_number }}">上一页</a>
{% else %}
	下一页
{% endif %}
```

## 内建用户系统

#### 自定义扩展字段的方法

- 建立一个一对一的表扩展 User 模型

  以后取字段需要查询

  ```python
  from django.contrib.auth.models import User
  
  class Employee(models.Model):
      user = models.OneToOneField(User, on_delete=models.CASCADE)
      department = models.CharField(max_length=100)
  ```

- 继承 AbstracUser 类替换 User 模型

  仍然可以使用 django 一套的用户操作

  ```python
  from django.contrib.auth.models import AbstractUser
  
  class User(AbstractUser):
      pass
  ```

  注意：需要在配置文件指定使用自己的用户类

  ```python
  AUTH_USER_MODEL = 'myapp.MyUser'
  ```

- django 建议在项目初期使用替换，项目中期使用一对一

- 此时引用 User 就应该使用你自定义的 User 名或者使用 get_user_model()方法

#### 默认用户的字段

- username
- password
- email
- first_name
- last_name

#### 创建用户

```python
>>> from django.contrib.auth.models import User
>>> user = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')

# At this point, user is a User object that has already been saved
# to the database. You can continue to change its attributes
# if you want to change other fields.
>>> user.last_name = 'Lennon'
>>> user.save()
```

#### 更改密码

set_password()

> 注意不能直接更新数据库中的密码，因为那是非明文操作的

```python
>>> from django.contrib.auth.models import User
>>> u = User.objects.get(username='john')
>>> u.set_password('new password')
>>> u.save()
```

#### 验证用户

```python
from django.contrib.auth import authenticate
user = authenticate(username='john', password='secret')
if user is not None:
    # A backend authenticated the credentials
else:
    # No backend authenticated the credentials
```

使用 authenticate() 来验证用户。它使用 username 和 password 作为参数来验证，对每个身份验证后端( authentication backend )进行检查。如果后端验证有效，则返回一个 :class:`~django.contrib.auth.models.User 对象。如果后端引发 PermissionDenied 错误，将返回 None

#### 登录

```python
from django.contrib.auth import authenticate, login

def my_view(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Redirect to a success page.
        ...
    else:
        # Return an 'invalid login' error message.
        ...
```

#### 登出

```python
from django.contrib.auth import logout

def logout_view(request):
    logout(request)
    # Redirect to a success page.
```

#### 限制对未登录用户的访问

```python
from django.conf import settings
from django.shortcuts import redirect

# 这里师是重定向到登录界面，并且 next 保留上一个界面的信息，方便登录后回到之前的界面
def my_view(request):
    if not request.user.is_authenticated:
        return redirect('%s?next=%s' % (settings.LOGIN_URL, request.path))
    # ...
```

#### login_required 装饰器

作用：

- 如果用户没有登录，会重定向到 setting.LOGIN_URL 中，并传递绝对路径到查询字符串中
- 或者直接写 url：@login_required(login_url='/accounts/login/')

#### 限制对通过测试的登录用户的访问

你可以方便的调用 `user_passes_test` 装饰器，当调用返回 `False` 时会执行重定向。

> user_passes_test(test_func, login_url=None, redirect_field_name='next')
>
> redirect_field_name:
> 与 login_required() 相同。如果你想把没通过检查的用户重定向到没有 "next page" 的非登录页面时，把它设置为 None ，这样它会在 URL 中移除。

```python
from django.contrib.auth.decorators import user_passes_test

def email_check(user):
    return user.email.endswith('@example.com')

@user_passes_test(email_check)
def my_view(request):
    ...
```

类的话继承**UserPassesTestMixin** # 其他的装饰器都有对应的 MIXIN 类，可查阅文档

#### permission_required 装饰器

permission_required(perm, login_url=None, raise_exception=False)

permission_required() 也可以接受可选的 login_url 参数——————去看文档

## 中间件

### 中间件的定义

- 中间是 Django 请求/响应处理的钩子框架。它是一个轻量级的低级的“插件”系统，用于全局改变 Django 的输入或输出。
- 中间件以类的形式体现。
- 每个中间件组件负责做一些特定的功能。例如，Django 包含一个中间组件 AuthenticationMiddleware,它使用会话将用户与请求关联起来。

### 编写中间件

> 一般是在项目文件夹下面单独建一个 middleware 文件夹，下面编写 middleware.py 文件

- 中间件类必须继承自 django.utils.deprecation.MiddlewareMixin 类

- 中间件类须实现下列五个方法中的一个或多个：

  - process_request(self, request)

    执行路由前被调用，在每个请求上调用，返回 None 或 HttpRespose 对象

    > 返回 None 就可以往后面走
    >
    > 返回 respose 就会拦截该请求

  - process_view(self, request, callback, callback_args. callback_kwargs)

    调用视图之前被调用，在每个请求上调用，返回 None 或 HttpResonse 对象

  - process_response(self, request, response)

    所有响应返回浏览器被调用，在每个请求上调用，返回 HttpResponse 对象

  - process_exception(self, request, exception)

    当处理过程中抛出异常时调用，返回一个 HttpResponse 对象

  - process_template_response(self, request, response)

    在视图函数执行完毕且视图返回的对象中包含 render 方法时被调用；该方法需要返回实现了 render 方法的响应对象

  注：中间件中的大多数方法返回 None 时标识忽略当前操作进入下一项事件，当返回 HttpResopnse 对象时表示此请求结束，直接返回给客户端

### 注册中间件

```python
# settings.py
MIDDLEWARE = [
    ...
]
# 执行顺序，从上到下，再从下到上
```

### 其他（实现限制访问者 IP 与服务器的请求次数）：

request.META['REMOTE_ADDR']可以得到远程客户端的 IP 地址

request.path_info 可以得到客户端访问的请求路由信息

```python
class VisitLimit(MiddlewareMixin):
    
    visit_times = {}  # 这里其实应该放到内存里面 redis
    
    def process_request(self, request):
        ip_address = request.META['REMOTE_ADDR']
        path_url = request.path_info
        if not re.match('^/test', path_yrl):
            return
        times= self.visit_ime.get(ip_adress, 0)
        print('ip', ip_address, '已经访问', times)
        self.visit_times[ip_address] = time+1
        if times < 5:
            return
        return HttpResponse("您已经访问过" + str(times) + '次， 访问被禁止')
```

### CSRF-跨站伪造请求攻击

某些恶意网站上包含连接、表单按钮或者 Javascript，它们会利用登录过的用户再浏览器中的认证信息视图再你的网站上完成某些操作，这就是跨站请求伪造（CSRF, 即 Cross-Site Request Forgey）

登录过的网站会将登录状态保存在 Cookie 里面然后如果没有退出，另一边网站上也会自动提交。

### CSRF 防范

- django 采用’比对暗号‘机制防范攻击
- Cookies 中存储暗号 1，模板中表单里藏着暗号 2，用户只有在本网站下提交数据，暗号 2 才会随表单提交给服务器 django 比对两个暗号，对比成功，则认为是合法请求，否则是违法请求-403

```python
# settings.py 中确认中间件中
django.moiddleware.csrf/csrfViewMiddleware 是否打开
# form 标签下添加如下标签
{% csrf_token %}
```

### 局部关闭 csrf 保护

```python
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def my_view(request):
    return HttpResponse('He')
```

## 文件上传

### 上传规范-前端[HTML]

- POST
- \<form\>中文件上传时必须带有 enctype="multipart/from-data"时才会包含文件内容数据。
- 表单中用\<input type="file" name="xxx"\>标签上传文件

```python
def test_upload(request):
    if request.method == "GET":
        return render(request, 'test_upload.html')
    elif request.method == "POST":
        return HttpResponse("--上传文件成功--")
```

```html
<from action="/test_upload" method="post" enctype="multipart/form-data">
	<p>
        <input type="text" name="title">
    </p>
    <p>
        <input type="file" name="myfile">
    </p>
    <p>
        <input type="submit" value="上传">
    </p>
</from>
```

### 上传规范-后端[Django]

视图函数中，用 request.FILES 取文件框的内容

```python
file=request.FILE['XXX']
'''
说明：
1. FILES 的 key 对应页面中 file 框的 name 值
2. file 绑定文件流对象
3. file.name 文件名
4. file.file 文件的字节流数据
'''
```

```python
'''
配置文件的访问路径和存储路径
在 setting.py 中设置 MEDIA 相关配置；Django 把用户上传的文件，统称为 media 资源
Django 把用户上传的文件，统称为 media 资源
'''
# file : settings.py
MEDIA_URL = '/media/'
MWDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

其中，MEDIA_URL 和 MEDIA_ROOT 需要手动绑定

```python
# 步骤：主路由中添加路由
from django.conf import settings
from django.conf.urls.static import static
urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
'''
等价于做了 MEDIA_URL 开头的路由，Django 接到该特征请求后取 MEDIA_ROOT 路径查找资源
'''
```

### 文件写入

```python
# 方案 1：传统的 open 方式
def upload_view(request):
    if request.method == 'GET':
        return render(request, 'test_upload.html')
    elif request.method == 'POST':
        a_file = request.FILES['myfile']
        print("上传文件名是：", a_file.name)
        filename = os.path.join(setting.MEDIA_ROOT, a_file.name)
        with open(filename, 'wb') as f:
            data = a_file.file.read()
            f.write(data)
            
        return HttpResponse("接收文件：" + a_file.name + "成功")
# 有一些问题，比如文件重名等细节
```

```python
# 方案 2：借助 ORM
# 字段：FileField(upload='子目录名')

@csrf_exempt
def upload_view_dj(request):
    if request.method == 'GET':
        return render(request, 'test_upload.html')
    elif request.method == 'POST':
        title = request.POST['title']
        a_file = request.FILES['myfile']
        # 就这下面一项就可以存
        Content.objects.create(desc=title, myfile=a_file)
        return HttpResponse('----upload is ok----')
```

## 邮件

### 邮件相关协议-SMTP

- SMTP 的全称是"Simple Mail TransferProtocol"，即简单邮件传输协议（25 号端口）
- 它是一组用于从源地址到目的地址传输邮件的规范，通过它来控制邮件的中转
- **属于”推送“协议**

### 邮件相关协议 IMAP

- IMAP 的全称是 Internet Mail Access Protocol，即交互式邮件访问协议，是一个应用层协议（端口 143）
- 用来从本地邮件客户端（outlook, foxmail 等）访问远程服务器上的邮件
- **属于”拉取“协议**

### 邮件相关协议 POP3

- TCP/IP 中的一员(端口 110)
- 本协议主要用于支持使用客户端远程管理在服务器上的电子邮件
- 属于"拉取"协议

### 对比

- IMAP 具备摘要浏览功能，可预览部分摘要，再下载整个邮件
- IMAP 为双向协议，客户端操作可反馈给服务器



- POP3 必须下载全部邮件，无摘要功能
- POP3 为单向协议，客户端操作无法同步服务器

### Django 发邮件

- Django 中配置邮件功能，主要为 SMTP 协议，负责发邮件
- 原理：
  - 给 djangp 授权一个邮箱
  - django 用给邮箱给对应发件人发送邮件
  - django.core.mail 封装了电子邮件的自动发送 SMTP 协议

##### 配置

```python
# 先获取 SMTP 服务的授权码
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'SMTP.qq.com'
EMAILPORT = 25 # SMTP 服务的端口号
EMAIL_HOST_USER = 'xxxx@qq.com' # 发送邮件的 qq 邮箱
EMAIL_HOST_PASSWORD = '******' # QQ 邮箱->设置->账户->'POP3/IMAP...服务'里面得到的授权码
EMAIL_USE_TLS = False # 是否启动 TLS 链接（安全链接）默认 False--比较费时
```

##### 调用

```python
from django.core import mail
mail.send_mail(
	subject,  # 题目
    message,  # 消息内容
    from_email,  # 发送者[当前配置邮箱]
    recipient_list=['xxx@qq.com'], # 接收者邮件列表
)
```

##### 其他--捕获异常

向开发人员邮箱发送(tranceback.format_exc())而不是(exception)

## 缓存

### 缓存

是一类可以更快的读取数据的介质统称，一般用来存储临时数据。

视图渲染有一定的成本，数据库频繁查询过高，所以对于**低频变动的页面**可以考虑使用缓存技术，减少实际渲染次数，用户拿到响应的时间成本会更低。

```python
given a URL, try finding that page in the cache
if the page is in the cache:
    return the cache page
else:
    generate the page
    save the generated page in the cache (for next time)
    return the generated age
```

### Django 中设置缓存-数据库缓存

将缓存的数据存储在您的数据库中

> 尽管存储介质没有变化，但是当把一次负责查询的结果直接存储到表里面，比如多个条件的过滤查询结果，课避免进行复杂的查询，提升效率；

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'my_cache_table',
        'TIMEOUT': 300, # 缓存保存时间 单位秒，默认值为 300
        'OPTIONS': {
            'MAX_ENTRIES': 300, # 缓存最大数据条数
            'CULL_FREQUENCY': 2, # 缓存条数达到最大值时，删除 1/x 的缓存数据
        }
    }
}
```

### Django 中设置缓存-本地内存缓存

数据缓存到服务器内存中

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

还有文件系统缓存等

https://docs.djangoproject.com/zh-hans/3.2/topics/cache/

### Django 中使用缓存-视图函数中

```python
from django.views.decorators.cache import cache_page

@cache_apge(30)  -> 单位 s
def my_view(request):
    pass
```

### Django 中使用缓存-路由中

```python
from django.views.decorators.cache import cache_page

urlpatterns = [
    path('foo/', cache_page(60)(my_view)),
]
```

### 缓存 API 的使用(局部缓存)

> 上面的两个例子都是整体缓存，但灵活性低并且复用性差，是直接缓存的整个界面，而如果直接缓存 sql 结果的话就能解决这些问题

##### 先引入 cache 对象

- 使用 caches['**CACHE 配置 key**']导入具体对象

  > 这个就是配置中配置了多个配置项使用

  ```python
  from django.care.cache import caches
  
  cache1 = caches['myalias']
  cacahe2 = caches['myalias_2']
  ```

- from django.core.cache import **cache** 相当于直接引入 CACEHS 配置项中的'default'项

##### 使用

```python
cache.set(key, value, timeout) # 存储缓存
'''
key: 缓存的对象
value: python 对象
timeout: 缓存存储时间(s),默认为 CACHES 中的 TIMEOUT 值
返回值 None
'''
```

```python
cache.get(key) # 获取缓存(温柔地取)
cache.add(key, value) # 存储缓存，仅在 key 不存在时生效
```

其他方法：

```python
cache.get_or_set(key, value, timeout) # 如果未获取到数据，则执行 set 操作
cache.set_many(dict, timeout) # 批量存储缓存
cache.get_many(key_list)
cache.delete(key)
cache.delete_many(key_list)2
```

### 浏览器缓存策略

##### 强缓存

> 不会向服务器发送请求，直接从缓存中读取资源

- 响应头-Expires(绝对时间)

  定义：缓存过期时间，用来指定资源到期的时间，是服务端的集体的时间点

  样例：Expires:Thu,02 Apr 2030 05......

- 响应头-Cache-Control(相对时间)

  在 HTTP/1.1 中，Cache-Control 主要用于控制网页缓存。比如 Cache-Control：max-age=120 表示请求创建时间的 120 秒后缓存失效

说明：目前服务器都会带着这两个头同时响应给浏览器，浏览器优先使用 Cache-Control

##### 协商缓存

强缓存中的数据一旦过期，还需要更服务器进行通信，从而获取最新数据

如果强缓存中的数据是一些静态文件、大图片等呢？

解答：考虑到大土拍你这类比较消耗贷款且不易变化的数据，强缓存时间到期后，浏览器会去跟服务器协商，当前缓存是否可用，如果可用，服务器不必返回数据，浏览器继续使用原来缓存的数据，如果文件不可用，则返回最新数据。

Last-Modified 响应头和 If-Modified-Since 请求头

> 协商缓存是在强缓存基础之下的，所以正常情况下，协商缓存回避强缓存多上面的这个头

Last-Modified：文件的最近修改时间

If-Modified-Since：当缓存到期后，浏览器将获取到的 Last-Modified 值作为请求头 If-Modified-Since 的值，与服务器发请求协商，服务端返回 304 响应码【响应体为空】，代表缓存继续使用，200 响应码代表缓存不可用【响应体为最新资源】

Etag 响应头和 If-None-Match 请求头

> （现在一般用这个，这个算的是哈希来判断是否更改，上面那个是时间到秒：修改时间来判断）

- Etag 时服务器响应请求时，返回当前资源文件的一个唯一标识（有服务器生成），只要资源有变化，Etag 就会重新生成；
- 缓存到期后，浏览器将 Etag 响应头的值做为 If-None-Match 请求头的值，给服务器发起请求协商；服务器街道请求头后，比对文件标识，不一致则认为资源不可用，返回 200 响应码【响应体为最新资源】；可用则返回 304 响应码


