- [英文原视频](https://learn.deeplearning.ai/chatgpt-prompt-eng/lesson/1/introduction)
- [B 站翻译](https://www.bilibili.com/video/BV1No4y1t7Zn)

# 扩展

温度参数介绍：

它允许我们改变模型的多样性

- 一般来说使用 0 就可以了
- 当我们需要得到创意时，就可以增加其多样性

![温度参数介绍](https://oss.justin3go.com/blogs/20230503112223.png)

## 准备工作


```python
! pip install --upgrade openai
```

    Looking in indexes: https://pypi.org/simple, https://us-python.pkg.dev/colab-wheels/public/simple/
    Collecting openai
      Downloading openai-0.27.6-py3-none-any.whl (71 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m71.9/71.9 kB[0m [31m2.4 MB/s[0m eta [36m0:00:00[0m
    [?25hCollecting aiohttp
      Downloading aiohttp-3.8.4-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.0 MB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m1.0/1.0 MB[0m [31m20.1 MB/s[0m eta [36m0:00:00[0m
    [?25hRequirement already satisfied: tqdm in /usr/local/lib/python3.10/dist-packages (from openai) (4.65.0)
    Requirement already satisfied: requests>=2.20 in /usr/local/lib/python3.10/dist-packages (from openai) (2.27.1)
    Requirement already satisfied: urllib3<1.27,>=1.21.1 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (1.26.15)
    Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2022.12.7)
    Requirement already satisfied: charset-normalizer~=2.0.0 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2.0.12)
    Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (3.4)
    Collecting async-timeout<5.0,>=4.0.0a3
      Downloading async_timeout-4.0.2-py3-none-any.whl (5.8 kB)
    Collecting frozenlist>=1.1.1
      Downloading frozenlist-1.3.3-cp310-cp310-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (149 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m149.6/149.6 kB[0m [31m9.2 MB/s[0m eta [36m0:00:00[0m
    [?25hCollecting multidict<7.0,>=4.5
      Downloading multidict-6.0.4-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (114 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m114.5/114.5 kB[0m [31m983.0 kB/s[0m eta [36m0:00:00[0m
    [?25hCollecting yarl<2.0,>=1.0
      Downloading yarl-1.9.2-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (268 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m268.8/268.8 kB[0m [31m6.9 MB/s[0m eta [36m0:00:00[0m
    [?25hRequirement already satisfied: attrs>=17.3.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (23.1.0)
    Collecting aiosignal>=1.1.2
      Downloading aiosignal-1.3.1-py3-none-any.whl (7.6 kB)
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


```python
text = get_completion("任意生成一封 200 字的产品评价邮件，总体来说是积极评价，但也说了一些缺点")
print(text)
```

    尊敬的客服：
    
    我购买了贵公司的产品，使用了一段时间后，我想给您写一封评价邮件。
    
    首先，我要说的是，这款产品的质量非常好，使用起来非常方便，功能也非常强大。我非常喜欢它的外观设计，非常时尚，非常符合我的口味。同时，它的性能也非常出色，让我非常满意。
    
    但是，我也发现了一些缺点。首先，它的价格有点高，对于一些消费者来说可能会有些贵。其次，它的使用说明书有些简略，对于一些不太懂电子产品的消费者来说可能会有些困难。
    
    总的来说，我非常喜欢这款产品，它的质量和性能都非常出色。但是，如果能够降低一下价格，并且提供更详细的使用说明书，那么它将会更加完美。希望贵公司能够不断改进，为消费者提供更好的产品和服务。
    
    谢谢！
    
    此致
    
    敬礼
    
    XXX
    


```python
prompt = f"""
请对下面的邮件进行比较官方正式的邮件回复，在对每一句进行分析中，如果是积极的评价，请表示感谢，如果是消极的评价，请表示道歉：
```{text}```
"""
res = get_completion(prompt)
print(res)
```

    尊敬的客户，
    
    感谢您购买我们公司的产品，并且抽出时间给我们写一封评价邮件。我们非常重视您的反馈，也非常感谢您对我们产品的积极评价。
    
    我们很高兴听到您对我们产品的质量、方便性和功能的赞扬。我们一直致力于为客户提供高质量的产品和服务，您的肯定是我们最大的鼓励。
    
    同时，我们也非常抱歉您对产品的价格和使用说明书有所不满。我们会认真考虑您的建议，并且努力改进我们的产品和服务，以满足客户的需求。
    
    再次感谢您的反馈和支持，我们期待为您提供更好的产品和服务。
    
    此致
    
    敬礼
    
    XXX
    

## 调整 temperature 参数


```python
def get_completion(prompt, temperature=0, model="gpt-3.5-turbo"):
  messages = [{"role": "user", "content": prompt}]
  response = openai.ChatCompletion.create(
      model=model,
      messages=messages,
      temperature=temperature
  )
  return response.choices[0].message["content"]
```


```python
prompt = f"""
请对下面的邮件进行比较官方正式的邮件回复，在对每一句进行分析中，如果是积极的评价，请表示感谢，如果是消极的评价，请表示道歉：
```{text}```
"""
res = get_completion(prompt, temperature=0.5)
print(res)
```

    尊敬的客户，
    
    感谢您购买我们公司的产品，并对其进行评价。我们非常感激您对我们产品质量和性能的积极评价，同时也非常抱歉您在使用说明书和价格方面遇到了一些问题。
    
    对于价格方面，我们会认真考虑您的反馈并进行合理调整，以满足更多消费者的需求。同时，我们也会加强使用说明书的编写，让消费者更加轻松地使用我们的产品。
    
    再次感谢您对我们产品的支持和反馈，我们会持续改进，为您提供更好的产品和服务。
    
    此致
    
    敬礼
    
    XXX
    


```python
prompt = f"""
我需要写前端技术博客的题材
"""
res = get_completion(prompt, temperature=0.8)
print(res)
```

    1. 最新的前端框架和库介绍及使用体验分享。
    2. 前端开发中常见的性能优化技巧及实践。
    3. 前端设计模式的深入探讨和实际应用。
    4. 前端常用工具或插件的使用和比较评价。
    5. 前端对于搜索引擎优化的探索与实践。
    6. 前端对于 Web 安全的理解和实践。
    7. 机器学习和人工智能在前端开发中的应用。
    8. 移动端前端开发的技术难点和最佳实践。
    9. 前端开发中的可访问性设计和实现。
    10. 对于 Web 前端未来的发展趋势和技术预测。
    


```python
prompt = f"""
我需要写前端技术博客的题材
"""
res = get_completion(prompt, temperature=0.2)
print(res)
```

    1. 最新的前端开发趋势和技术
    2. 前端框架的比较和选择
    3. 前端性能优化技巧
    4. 前端安全性和防范措施
    5. 前端设计模式和架构
    6. 前端工具和插件的使用和优化
    7. 前端测试和调试技巧
    8. 前端跨平台开发技术
    9. 前端数据可视化和交互设计
    10. 前端 SEO 和搜索引擎优化技巧
    


```python

```
