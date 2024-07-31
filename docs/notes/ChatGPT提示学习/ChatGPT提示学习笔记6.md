- [英文原视频](https://learn.deeplearning.ai/chatgpt-prompt-eng/lesson/1/introduction)
- [B 站翻译](https://www.bilibili.com/video/BV1No4y1t7Zn)

# 转换

- 语言翻译工作
- 语法修正工作
- 格式转换：HTML、JSON

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
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m1.0/1.0 MB[0m [31m18.6 MB/s[0m eta [36m0:00:00[0m
    [?25hRequirement already satisfied: tqdm in /usr/local/lib/python3.10/dist-packages (from openai) (4.65.0)
    Requirement already satisfied: requests>=2.20 in /usr/local/lib/python3.10/dist-packages (from openai) (2.27.1)
    Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2022.12.7)
    Requirement already satisfied: urllib3<1.27,>=1.21.1 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (1.26.15)
    Requirement already satisfied: charset-normalizer~=2.0.0 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2.0.12)
    Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (3.4)
    Collecting yarl<2.0,>=1.0
      Downloading yarl-1.9.2-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (268 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m268.8/268.8 kB[0m [31m10.5 MB/s[0m eta [36m0:00:00[0m
    [?25hCollecting multidict<7.0,>=4.5
      Downloading multidict-6.0.4-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (114 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m114.5/114.5 kB[0m [31m988.5 kB/s[0m eta [36m0:00:00[0m
    [?25hCollecting async-timeout<5.0,>=4.0.0a3
      Downloading async_timeout-4.0.2-py3-none-any.whl (5.8 kB)
    Collecting aiosignal>=1.1.2
      Downloading aiosignal-1.3.1-py3-none-any.whl (7.6 kB)
    Requirement already satisfied: attrs>=17.3.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (23.1.0)
    Collecting frozenlist>=1.1.1
      Downloading frozenlist-1.3.3-cp310-cp310-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (149 kB)
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m149.6/149.6 kB[0m [31m5.6 MB/s[0m eta [36m0:00:00[0m
    [?25hInstalling collected packages: multidict, frozenlist, async-timeout, yarl, aiosignal, aiohttp, openai
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

## 翻译


```python
text = "ChatGPT 正在影响人类社会"

prompt = f"""
请翻译下面的文本：
```{text}```
"""

res = get_completion(prompt)
res
```




    'ChatGPT is influencing human society.'




```python
text = get_completion('任意生成一个 100 字的小故事')
print(text)

prompt = f"""
请翻译下面的文本：
```{text}```
"""

res = get_completion(prompt)
res
```

    从前有一个小男孩，他非常喜欢探险。一天，他决定去探索一座神秘的山洞。他带上了一些食物和水，然后开始了他的冒险之旅。当他到达山洞时，他发现洞口非常狭窄，他必须爬进去。他爬了很长时间，终于到达了一个巨大的洞穴。在洞穴里，他发现了一些奇怪的生物和宝藏。他非常兴奋，但也非常累。他决定在洞穴里休息一下，然后再回家。当他醒来时，他发现自己被困在了洞穴里。他必须想办法逃脱。他开始寻找出路，最终他找到了一条通往外面的路。他成功逃脱了洞穴，回到了家。从那以后，他再也没有去探险了。
    




    'Once upon a time, there was a little boy who loved to explore. One day, he decided to explore a mysterious cave. He brought some food and water and began his adventure. When he arrived at the cave, he found that the entrance was very narrow and he had to crawl inside. He crawled for a long time and finally reached a huge cave. In the cave, he found some strange creatures and treasures. He was very excited but also very tired. He decided to rest in the cave and then go home. When he woke up, he found himself trapped in the cave. He had to find a way to escape. He began to look for a way out and finally found a path leading outside. He successfully escaped the cave and returned home. Since then, he never went exploring again.'



## 润色


```python
text = "我可以和你一起出去游泳吗？"

prompt = f"""
请使用正式和非正式的语气用英文翻译下面的文本：
```{text}```
"""

res = get_completion(prompt)
print(res)
```

    正式语气：May I accompany you for a swim?
    
    非正式语气：Can I come with you for a swim?
    


```python
text = "我可以和你一起出去游泳吗？"

prompt = f"""
请使用商业邮件的语气用润色下面的文本：
```{text}```
"""

res = get_completion(prompt)
print(res)
```

    尊敬的 XXX，
    
    我想询问一下，是否有可能和您一起出去游泳呢？如果您有时间和兴趣，我非常期待能够和您一起享受这个美好的活动。
    
    谢谢您的时间和耐心等待我的回复。
    
    祝好，
    
    XXX
    

## 格式的转换


```python
text = get_completion("任意生成一段 JSON 格式的文本")
print(text)

prompt = f"""
请将下面的 JSON 格式转换为 HTML 中的表格:
```{text}```
"""

res = get_completion(prompt)
print(res)
```

    {
      "name": "John Doe",
      "age": 30,
      "email": "johndoe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zip": "12345"
      },
      "phoneNumbers": [
        {
          "type": "home",
          "number": "555-555-1234"
        },
        {
          "type": "work",
          "number": "555-555-5678"
        }
      ],
      "isActive": true,
      "balance": 1000.50,
      "tags": [
        "sports",
        "music",
        "travel"
      ]
    }
    <table>
      <tr>
        <td>Name:</td>
        <td>John Doe</td>
      </tr>
      <tr>
        <td>Age:</td>
        <td>30</td>
      </tr>
      <tr>
        <td>Email:</td>
        <td>johndoe@example.com</td>
      </tr>
      <tr>
        <td>Address:</td>
        <td>
          <ul>
            <li>Street: 123 Main St</li>
            <li>City: Anytown</li>
            <li>State: CA</li>
            <li>Zip: 12345</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>Phone Numbers:</td>
        <td>
          <ul>
            <li>Type: home, Number: 555-555-1234</li>
            <li>Type: work, Number: 555-555-5678</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>Is Active:</td>
        <td>true</td>
      </tr>
      <tr>
        <td>Balance:</td>
        <td>1000.50</td>
      </tr>
      <tr>
        <td>Tags:</td>
        <td>
          <ul>
            <li>sports</li>
            <li>music</li>
            <li>travel</li>
          </ul>
        </td>
      </tr>
    </table>
    


```python
from IPython.display import display, HTML

display(HTML(res))
```


<table>
  <tr>
    <td>Name:</td>
    <td>John Doe</td>
  </tr>
  <tr>
    <td>Age:</td>
    <td>30</td>
  </tr>
  <tr>
    <td>Email:</td>
    <td>johndoe@example.com</td>
  </tr>
  <tr>
    <td>Address:</td>
    <td>
      <ul>
        <li>Street: 123 Main St</li>
        <li>City: Anytown</li>
        <li>State: CA</li>
        <li>Zip: 12345</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Phone Numbers:</td>
    <td>
      <ul>
        <li>Type: home, Number: 555-555-1234</li>
        <li>Type: work, Number: 555-555-5678</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Is Active:</td>
    <td>true</td>
  </tr>
  <tr>
    <td>Balance:</td>
    <td>1000.50</td>
  </tr>
  <tr>
    <td>Tags:</td>
    <td>
      <ul>
        <li>sports</li>
        <li>music</li>
        <li>travel</li>
      </ul>
    </td>
  </tr>
</table>



```python

```
