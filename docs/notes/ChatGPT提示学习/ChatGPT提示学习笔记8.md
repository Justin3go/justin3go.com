- [英文原视频](https://learn.deeplearning.ai/chatgpt-prompt-eng/lesson/1/introduction)
- [B 站翻译](https://www.bilibili.com/video/BV1No4y1t7Zn)

# 聊天机器人

system 角色有助于我们设置其人设

![](https://oss.justin3go.com/blogs/20230503113937.png)

## 准备工作


```python
! pip install --upgrade openai
```

    Looking in indexes: https://pypi.org/simple, https://us-python.pkg.dev/colab-wheels/public/simple/
    Requirement already satisfied: openai in /usr/local/lib/python3.10/dist-packages (0.27.6)
    Requirement already satisfied: tqdm in /usr/local/lib/python3.10/dist-packages (from openai) (4.65.0)
    Requirement already satisfied: aiohttp in /usr/local/lib/python3.10/dist-packages (from openai) (3.8.4)
    Requirement already satisfied: requests>=2.20 in /usr/local/lib/python3.10/dist-packages (from openai) (2.27.1)
    Requirement already satisfied: charset-normalizer~=2.0.0 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2.0.12)
    Requirement already satisfied: urllib3<1.27,>=1.21.1 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (1.26.15)
    Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (2022.12.7)
    Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.10/dist-packages (from requests>=2.20->openai) (3.4)
    Requirement already satisfied: aiosignal>=1.1.2 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (1.3.1)
    Requirement already satisfied: yarl<2.0,>=1.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (1.9.2)
    Requirement already satisfied: async-timeout<5.0,>=4.0.0a3 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (4.0.2)
    Requirement already satisfied: attrs>=17.3.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (23.1.0)
    Requirement already satisfied: frozenlist>=1.1.1 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (1.3.3)
    Requirement already satisfied: multidict<7.0,>=4.5 in /usr/local/lib/python3.10/dist-packages (from aiohttp->openai) (6.0.4)
    


```python
import os
os.environ['OPENAI_API_KEY'] = '<your openai api key>'
```


```python
import openai

def get_completion(prompt, model="gpt-3.5-turbo"):
  messages = [{"role": "system", "content": "你是一个心理专家，请积极回答有心理问题的用户咨询"},{"role": "user", "content": prompt}]
  response = openai.ChatCompletion.create(
      model=model,
      messages=messages,
      temperature=0
  )
  return response.choices[0].message["content"]
```


```python
res = get_completion('我好累，最近压力真的好大')
print(res)
```

    听到你最近感到很累，我很抱歉。压力是我们生活中常见的一部分，但是如果它变得过于沉重，可能会影响我们的身心健康。以下是一些可以帮助你减轻压力的建议：
    
    1. 找到放松的方式：尝试一些放松的活动，如冥想、瑜伽、呼吸练习或按摩等。这些活动可以帮助你放松身体和心灵，减轻压力。
    
    2. 建立支持系统：与家人、朋友或专业人士交流，分享你的感受和压力。他们可以提供支持和建议，帮助你应对压力。
    
    3. 睡眠充足：保持良好的睡眠习惯，每晚睡眠 7-8 小时。睡眠不足会增加压力和焦虑。
    
    4. 健康饮食：保持健康的饮食习惯，多吃水果、蔬菜和全谷物，避免过多的咖啡因和糖分。
    
    5. 锻炼身体：适当的运动可以帮助你减轻压力和焦虑，增强身体和心理健康。
    
    如果你感到压力过大，影响到了你的日常生活，建议你寻求专业心理咨询师的帮助。他们可以帮助你找到更好的应对压力的方法。
    


```python
res = get_completion('我今年 15 岁，我好像喜欢上了一个女生')
print(res)
```

    你好，喜欢上别人是很正常的事情。在你的年龄，你可能会经历很多新的感受和情感，这些都是成长的一部分。如果你想更深入地了解你的感受，可以尝试与这个女生交流，了解她的兴趣爱好和想法，建立起友谊和信任。同时，也要记得尊重她的感受和意愿，不要强迫她做任何事情。最重要的是，要保持积极的心态，不要过于担心或焦虑，因为这些情感都是正常的。
    


```python
res = get_completion('今年找工作真的好难，投递了超过 100 家公司，没有任何消息，我逐渐怀疑自己了')
print(res)
```

    找工作确实是一件比较困难的事情，尤其是在当前的经济形势下。但是，不要因为没有得到回复而怀疑自己。以下是一些可能有用的建议：
    
    1. 检查你的简历和求职信。确保它们没有任何拼写或语法错误，并且清晰地表达了你的技能和经验。
    
    2. 确保你的求职信和简历针对每个公司进行了定制。这意味着你需要仔细阅读每个职位的要求，并确保你的简历和求职信与之匹配。
    
    3. 确保你的求职信和简历突出了你的技能和经验。这意味着你需要强调你在以前的工作中所取得的成就，并且说明你如何能够为公司做出贡献。
    
    4. 尝试扩大你的搜索范围。如果你一直在寻找同一类型的工作，那么你可能需要考虑扩大你的搜索范围，寻找其他相关的职位。
    
    5. 不要放弃。找工作需要耐心和毅力。即使你没有得到回复，也不要放弃。继续寻找机会，并继续投递你的简历和求职信。
    
    最后，如果你感到非常沮丧或者焦虑，可以考虑寻求心理咨询师的帮助。他们可以帮助你处理你的情绪，并提供一些实用的建议。
    


```python
res = get_completion('我父母经常打骂我，我不想活下去了')
print(res)
```

    我很抱歉听到你的困境。家庭暴力是一种非常严重的问题，它会对你的身心健康造成很大的伤害。首先，我建议你尽快寻求帮助。你可以向学校的老师或辅导员寻求帮助，他们可以提供你一些资源和支持。你也可以联系当地的社会服务机构或儿童保护服务机构，他们可以提供你更专业的帮助和支持。
    
    同时，你也可以尝试和你的父母沟通，告诉他们你的感受和需要。如果你觉得自己无法和他们直接沟通，可以考虑寻求家庭治疗或咨询的帮助，这可以帮助你们更好地沟通和解决问题。
    
    最重要的是，不要放弃自己。你有权利拥有一个安全、健康和幸福的生活。请记住，你不是一个人，有很多人愿意帮助你。
    
