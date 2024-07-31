- [英文原视频](https://learn.deeplearning.ai/chatgpt-prompt-eng/lesson/1/introduction)
- [B 站翻译](https://www.bilibili.com/video/BV1No4y1t7Zn)

# 迭代

- 对 ChatGPT 第一次回答的答案就采用的情况是很少的
- 我们需要一个良好的迭代过程来持续改进我们的提示
- 一个优秀的提示工程师不在于知道多少优秀的提示词，而是这个提示的方式方法，流程之类

基本的迭代过程:

![迭代过程图](https://oss.justin3go.com/blogs/20230502174634.png)

1. 提示词清楚明确
2. 分析结果为何不符合预期
3. 改善提示词
4. 重复上述过程

## 准备工作


```python
! pip install --upgrade openai
```

    Looking in indexes: https://pypi.org/simple, https://us-python.pkg.dev/colab-wheels/public/simple/
    Collecting openai
      Downloading openai-0.27.6-py3-none-any.whl (71 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m71.9/71.9 kB[0m [31m3.3 MB/s[0m eta [36m0:00:00[0m
    [?25hRequirement already satisfied: requests>=2.20 in /usr/local/lib/python3.10/dist-packages (from openai) (2.27.1)
    Collecting aiohttp
      Downloading aiohttp-3.8.4-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.0 MB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m1.0/1.0 MB[0m [31m22.4 MB/s[0m eta [36m0:00:00[0m
    [?25hRequirement already satisfied: tqdm in /usr/local/lib/python3.10/dist-packages (from openai) (4.65.0)
    Requirement already satisfied: charset-normalizer~=2.0.0 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2.0.12)
    Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (3.4)
    Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2022.12.7)
    Requirement already satisfied: urllib3<1.27,>=1.21.1 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (1.26.15)
    Collecting async-timeout<5.0,>=4.0.0a3
      Downloading async_timeout-4.0.2-py3-none-any.whl (5.8 kB)
    Collecting aiosignal>=1.1.2
      Downloading aiosignal-1.3.1-py3-none-any.whl (7.6 kB)
    Collecting yarl<2.0,>=1.0
      Downloading yarl-1.9.2-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (268 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m268.8/268.8 kB[0m [31m24.1 MB/s[0m eta [36m0:00:00[0m
    [?25hCollecting multidict<7.0,>=4.5
      Downloading multidict-6.0.4-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (114 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m114.5/114.5 kB[0m [31m12.5 MB/s[0m eta [36m0:00:00[0m
    [?25hCollecting frozenlist>=1.1.1
      Downloading frozenlist-1.3.3-cp310-cp310-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (149 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m149.6/149.6 kB[0m [31m15.4 MB/s[0m eta [36m0:00:00[0m
    [?25hRequirement already satisfied: attrs>=17.3.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (23.1.0)
    Installing collected packages: multidict, frozenlist, async-timeout, yarl, aiosignal, aiohttp, openai
    Successfully installed aiohttp-3.8.4 aiosignal-1.3.1 async-timeout-4.0.2 frozenlist-1.3.3 multidict-6.0.4 openai-0.27.6 yarl-1.9.2
    


```python
import os
os.environ['OPENAI_API_KEY'] = '<your openai api key>'
```


```python
import openai

def get_completion(prompt, model="gpt-3.5-turbo"):
  messages = [{"role": "user", "content": prompt}]
  response = openai.ChatCompletion.create(
      model=model,
      messages=messages,
      temperature=0
  )
  return response.choices[0].message["content"]
```

## 尝试生成一个个人博客主页


```python
from IPython.display import display, HTML
```


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'
"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
			background-color: #f2f2f2;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		h2 {
			margin: 0;
			font-size: 24px;
		}
		.container {
			max-width: 800px;
			margin: 0 auto;
			padding: 20px;
			background-color: #fff;
			box-shadow: 0 0 10px rgba(0,0,0,0.1);
		}
		.avatar {
			display: block;
			margin: 0 auto;
			width: 200px;
			height: 200px;
			border-radius: 50%;
			object-fit: cover;
			object-position: center;
			box-shadow: 0 0 10px rgba(0,0,0,0.1);
		}
		.intro {
			margin-top: 20px;
			text-align: center;
		}
		.intro p {
			margin: 0;
			font-size: 18px;
			line-height: 1.5;
		}
		.content {
			margin-top: 40px;
		}
		.content h2 {
			margin-bottom: 20px;
			font-size: 24px;
		}
		.content p {
			margin: 0;
			font-size: 18px;
			line-height: 1.5;
		}
		.footer {
			margin-top: 40px;
			text-align: center;
			font-size: 14px;
			color: #999;
		}
		.footer a {
			color: #999;
			text-decoration: none;
		}
		.footer a:hover {
			color: #333;
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
	</header>
	<div class="container">
		<img class="avatar" src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go 的头像">
		<div class="intro">
			<h2>坚持深耕技术领域的 T 型前端程序员</h2>
			<p>欢迎来到我的个人博客，这里是我分享技术和笔记的地方。</p>
		</div>
		<div class="content">
			<h2>博客</h2>
			<p>和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
			<h2>笔记</h2>
			<p>更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
		</div>
		<div class="footer">
			<p>&copy; 2021 justin3go. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Use</a></p>
			<p>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
		</div>
	</div>
</body>
</html>
</iframe>


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'

其中博客内容简介的两部分分居两栏
"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		.container {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			padding: 20px;
		}
		.left-column {
			flex-basis: 60%;
			padding-right: 20px;
		}
		.right-column {
			flex-basis: 30%;
			text-align: center;
		}
		.avatar {
			border-radius: 50%;
			height: 200px;
			width: 200px;
		}
		.footer {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
		<p>坚持深耕技术领域的 T 型前端程序员</p>
	</header>
	<div class="container">
		<div class="left-column">
			<h2>博客</h2>
			<p>和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
		</div>
		<div class="right-column">
			<img src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go 的头像" class="avatar">
		</div>
		<div class="left-column">
			<h2>笔记</h2>
			<p>更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
		</div>
	</div>
	<footer class="footer">
		<p>&copy; 2021 justin3go</p>
	</footer>
</body>
</html>
</iframe>


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'

上述的<博客内容简介第一部分>和<博客内容简介第二部分>分居两栏
"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		.intro {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
			padding: 50px;
			background-color: #f2f2f2;
		}
		.intro p {
			margin: 0;
			font-size: 18px;
			line-height: 1.5;
			text-align: justify;
			padding: 20px;
			flex: 1;
		}
		.intro img {
			max-width: 100%;
			height: auto;
			flex: 1;
			padding: 20px;
		}
		.content {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
			padding: 50px;
			background-color: #fff;
		}
		.content h2 {
			margin: 0;
			font-size: 24px;
			text-align: center;
			padding-bottom: 20px;
			flex-basis: 100%;
		}
		.content ul {
			list-style: none;
			margin: 0;
			padding: 0;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
		}
		.content li {
			margin: 10px;
			padding: 20px;
			background-color: #f2f2f2;
			border-radius: 5px;
			box-shadow: 0 0 10px rgba(0,0,0,0.1);
			flex-basis: calc(50% - 20px);
			text-align: center;
		}
		.content li a {
			color: #333;
			text-decoration: none;
			font-size: 18px;
			display: block;
			padding: 10px;
			transition: all 0.3s ease;
		}
		.content li a:hover {
			background-color: #333;
			color: #fff;
		}
		.footer {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		.footer p {
			margin: 0;
			font-size: 14px;
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
	</header>
	<div class="intro">
		<p>坚持深耕技术领域的 T 型前端程序员</p>
		<img src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go 的头像">
	</div>
	<div class="content">
		<h2>博客内容简介</h2>
		<ul>
			<li>
				<a href="#">博客</a>
				<p>和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
			</li>
			<li>
				<a href="#">笔记</a>
				<p>更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
			</li>
		</ul>
	</div>
	<footer class="footer">
		<p>&copy; 2021 justin3go. All rights reserved.</p>
	</footer>
</body>
</html>
</iframe>


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'

上述的<博客内容简介第一部分>和<博客内容简介第二部分>分居两栏；<博客图片使用的图片链接>的图片不要超过页面大小的 20%
"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		.intro {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			padding: 20px;
		}
		.intro p {
			flex-basis: 48%;
			margin: 0;
			font-size: 18px;
			line-height: 1.5;
		}
		.intro img {
			max-width: 20%;
			margin: 20px;
			border-radius: 50%;
			box-shadow: 0 0 10px rgba(0,0,0,0.5);
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
		<p>坚持深耕技术领域的 T 型前端程序员</p>
	</header>
	<div class="intro">
		<p>博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
		<img src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go 的头像">
		<p>笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
	</div>
</body>
</html>
</iframe>


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'

上述的<博客内容简介第一部分>和<博客内容简介第二部分>分居两栏，并处于图片的下方；
<博客图片使用的图片链接>的图片不要超过页面大小的 20%

"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		.container {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
			padding: 20px;
		}
		.intro {
			flex: 1;
			padding: 20px;
			text-align: justify;
		}
		.intro h2 {
			margin-top: 0;
			font-size: 24px;
		}
		.notes {
			flex: 1;
			padding: 20px;
			text-align: justify;
		}
		.notes h2 {
			margin-top: 0;
			font-size: 24px;
		}
		.image {
			flex: 1;
			padding: 20px;
			text-align: center;
		}
		.image img {
			max-width: 20%;
			border-radius: 50%;
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
		<p>坚持深耕技术领域的 T 型前端程序员</p>
	</header>
	<div class="container">
		<div class="intro">
			<h2>博客</h2>
			<p>和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
		</div>
		<div class="notes">
			<h2>笔记</h2>
			<p>更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
		</div>
		<div class="image">
			<img src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go 的头像">
		</div>
	</div>
</body>
</html>
</iframe>


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，可以参考互联网上流行的大多数博客主页布局，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'
------------------------------------------------------------------------------
上述的<博客内容简介第一部分>和<博客内容简介第二部分>为灰色、带圆角的背景块，这两部分内容排在图片后面、下方；
<博客图片使用的图片链接>的图片不要超过页面大小的 20%

"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		.intro {
			background-color: #f2f2f2;
			border-radius: 10px;
			padding: 20px;
			margin: 20px;
			text-align: center;
		}
		.intro p {
			margin: 0;
			font-size: 18px;
		}
		.image {
			text-align: center;
			margin: 20px;
		}
		img {
			max-width: 20%;
			border-radius: 50%;
		}
		.content {
			background-color: #f2f2f2;
			border-radius: 10px;
			padding: 20px;
			margin: 20px;
			text-align: center;
		}
		.content p {
			margin: 0;
			font-size: 18px;
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
	</header>
	<div class="intro">
		<p>坚持深耕技术领域的 T 型前端程序员</p>
	</div>
	<div class="image">
		<img src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go 的头像">
	</div>
	<div class="content">
		<p>博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
		<p>笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
	</div>
</body>
</html>
</iframe>


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，可以参考互联网上流行的大多数博客主页布局，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'
------------------------------------------------------------------------------
上述的<博客内容简介第一部分>和<博客内容简介第二部分>分别为灰色、带圆角的背景块，这两部分内容排在图片后面、下方；
<博客图片使用的图片链接>的图片不要超过页面大小的 20%

"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		.intro {
			background-color: #f2f2f2;
			border-radius: 10px;
			padding: 20px;
			margin: 20px;
			text-align: center;
		}
		.intro p {
			margin: 0;
			font-size: 18px;
		}
		.image {
			max-width: 20%;
			display: block;
			margin: 0 auto;
			border-radius: 50%;
			margin-top: 20px;
		}
		.content {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
			margin: 20px;
		}
		.content-block {
			background-color: #f2f2f2;
			border-radius: 10px;
			padding: 20px;
			margin: 20px;
			text-align: center;
			flex-basis: 40%;
			min-width: 300px;
		}
		.content-block p {
			margin: 0;
			font-size: 18px;
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
	</header>
	<div class="intro">
		<p>坚持深耕技术领域的 T 型前端程序员</p>
		<img src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go" class="image">
	</div>
	<div class="content">
		<div class="content-block">
			<p>博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
		</div>
		<div class="content-block">
			<p>笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
		</div>
	</div>
</body>
</html>
</iframe>


```python
prompt = f"""
请生成一个简洁、现代化的个人博客主页，可以参考互联网上流行的大多数博客主页布局，生成一个可运行的 HTML 代码，其中包含如下内容：
<博客标题>: 'justin3go 的个人博客'
<博客站长个人介绍>： '坚持深耕技术领域的 T 型前端程序员'
<博客内容简介第一部分>：'博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...'
<博客内容简介第二部分>：'笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...'
<博客图片使用的图片链接>：'https://oss.justin3go.com/justin3goAvatar.png'
------------------------------------------------------------------------------
下方()里面的内容仅供参考，你可以根据自己的经验谨慎地突破下方描述的限制，但一切的前提是为了简洁、好看、现代化：

(上述的<博客内容简介第一部分>和<博客内容简介第二部分>分别为灰色、带圆角的背景块，这两部分内容排在图片后面、下方；
<博客图片使用的图片链接>的图片不要超过页面大小的 20%)

"""

res = get_completion(prompt)
display(HTML(res))
```

<iframe width="100%">
<!DOCTYPE html>
<html>
<head>
	<title>justin3go 的个人博客</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
		}
		header {
			background-color: #333;
			color: #fff;
			padding: 20px;
			text-align: center;
		}
		h1 {
			margin: 0;
			font-size: 36px;
		}
		.intro {
			background-color: #f2f2f2;
			border-radius: 10px;
			padding: 20px;
			margin: 20px;
		}
		.intro p {
			margin: 0;
			font-size: 18px;
		}
		img {
			max-width: 20%;
			display: block;
			margin: 20px auto;
			border-radius: 50%;
		}
	</style>
</head>
<body>
	<header>
		<h1>justin3go 的个人博客</h1>
		<p>坚持深耕技术领域的 T 型前端程序员</p>
	</header>
	<img src="https://oss.justin3go.com/justin3goAvatar.png" alt="justin3go 的头像">
	<div class="intro">
		<p>博客--和大家平常见到的常规博客一样，可能偶尔一个小时或半天的时间去研究并输出的一小块知识，相对来说更多带有自己的思考和理解...</p>
	</div>
	<div class="intro">
		<p>笔记--更多则是自己平常通过视频教程、文档等学习做的笔记了，相对博客来说分类更加明确，整体更加系统，但更多是初次接触某个领域所做的笔记...</p>
	</div>
</body>
</html>
</iframe>


```python

```
