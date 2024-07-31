---
title: TFIDF 计算的学习
date: 2021-04-02
tags: 
  - TFIDF
  - 文本挖掘
  - 机器学习
  - 自然语言处理
  - Python
  - Sklearn
  - 余弦相似度
---

# TFIDF 计算的学习

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇博客中详细介绍了 TF-IDF（Term Frequency-Inverse Document Frequency）的计算过程，首先通过转码函数确保文本文件的编码为 UTF-8，并读取文件列表。接着，使用正则表达式对文本进行分词，从而建立词典并计算每个词的词频（TF）。随后，笔者构建了 TF 矩阵，并逐步计算每个词的逆文档频率（IDF），最终合并 TF 和 IDF 值以得到 TF-IDF 值。

此外，笔者也展示了使用 Sklearn 库来简化 TF-IDF 的计算过程，并介绍了如何计算文档之间的余弦相似度，以评估它们的相似性。整个过程通过代码示例和数据框展示，使得读者能够直观理解 TF-IDF 的实现细节及其应用。

<!-- DESC SEP -->

## 转码

### 定义转码函数


```python
# ! pip install codecs
# ! pip install chardet

import codecs
import chardet

def convert(filename, out_enc="UTF-8"):
    content = codecs.open(filename, 'rb').read()
    source_encoding = chardet.detect(content)['encoding']
    content = content.decode(source_encoding).encode(out_enc)
    codecs.open(filename, 'wb').write(content)

# 获取编码
def get_encoding(file):
	with open(file,'rb') as f:
		return chardet.detect(f.read())['encoding']

```

    ERROR: Could not find a version that satisfies the requirement codecs
    ERROR: No matching distribution found for codecs


    Requirement already satisfied: chardet in c:\users\justin3go\appdata\roaming\python\python38\site-packages (3.0.4)


### 读入文件并转码


```python
import chardet
import codecs
import os

# 读取文件
file_list = []
for root, _, files in os.walk("./实验六所用语料库"):
    for file in files:
        # print(os.path.join(root, file))
        file_list.append(os.path.join(root, file))

for file in file_list:
    convert(file)

get_encoding(file_list[0])
```


    'ascii'

## 生成词典


```python
import re
import pandas as pd
import numpy as np

# 分词建立词典,得到词频
dict_words = {}
files = []
files_ = []
for file in file_list:
	with open(file, 'r', encoding='ascii') as f:
		text = f.read().lower()
		files_.append(text)
	
	text_ = re.findall('[a-z]+', text)
	files.append(text_)

	for t in text_:
		dict_words[t] = dict_words.get(t, 0) + 1
```

## 生成 TF 矩阵


```python
import numpy as np
words2index = {w: i for i,w in enumerate(dict_words)}
index2words = {i: w for i,w in enumerate(dict_words)}
zeros_m = np.zeros((len(files),len(words2index)))
for i, f in enumerate(files):
	for t in f:
		# print(t)
		# print(words.index(f))
		zeros_m[i][words2index[t]] += 1

# tf 在个文档中的矩阵
zeros_m
```


    array([[1., 5., 5., ..., 0., 0., 0.],
           [0., 0., 0., ..., 0., 0., 0.],
           [0., 1., 0., ..., 0., 0., 0.],
           ...,
           [0., 4., 0., ..., 0., 0., 0.],
           [1., 5., 0., ..., 0., 0., 0.],
           [0., 1., 0., ..., 1., 1., 1.]])

## 逐步计算 IDF 值


```python
df1 = pd.DataFrame(dict_words,index=['TF']).T
df1.head()
```


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>TF</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>call</th>
      <td>2</td>
    </tr>
    <tr>
      <th>for</th>
      <td>20</td>
    </tr>
    <tr>
      <th>presentations</th>
      <td>5</td>
    </tr>
    <tr>
      <th>navy</th>
      <td>9</td>
    </tr>
    <tr>
      <th>scientific</th>
      <td>6</td>
    </tr>
  </tbody>
</table>

```python
# print(dict_words)
dict_words_idf = {}
for key in dict_words:
	count = 0
	# files 要上面那个单元运行之后存入内存才有
	for text_ in files:
		if key in text_:
			count += 1
	dict_words_idf[key] = count

df2 = pd.DataFrame(dict_words_idf,index=['DF']).T
df = pd.concat([df1,df2], axis=1)
df.head(10)
```


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>TF</th>
      <th>DF</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>call</th>
      <td>2</td>
      <td>2</td>
    </tr>
    <tr>
      <th>for</th>
      <td>20</td>
      <td>8</td>
    </tr>
    <tr>
      <th>presentations</th>
      <td>5</td>
      <td>1</td>
    </tr>
    <tr>
      <th>navy</th>
      <td>9</td>
      <td>1</td>
    </tr>
    <tr>
      <th>scientific</th>
      <td>6</td>
      <td>2</td>
    </tr>
    <tr>
      <th>visualization</th>
      <td>9</td>
      <td>4</td>
    </tr>
    <tr>
      <th>and</th>
      <td>50</td>
      <td>9</td>
    </tr>
    <tr>
      <th>virtual</th>
      <td>5</td>
      <td>1</td>
    </tr>
    <tr>
      <th>reality</th>
      <td>5</td>
      <td>1</td>
    </tr>
    <tr>
      <th>seminar</th>
      <td>5</td>
      <td>1</td>
    </tr>
  </tbody>
</table>

```python
import math
# log(len(files)/df,2)

df['IDF'] = df['DF'].apply(lambda x: math.log(len(files)/x,2))
df.head(10)
```


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>TF</th>
      <th>DF</th>
      <th>IDF</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>call</th>
      <td>2</td>
      <td>2</td>
      <td>2.321928</td>
    </tr>
    <tr>
      <th>for</th>
      <td>20</td>
      <td>8</td>
      <td>0.321928</td>
    </tr>
    <tr>
      <th>presentations</th>
      <td>5</td>
      <td>1</td>
      <td>3.321928</td>
    </tr>
    <tr>
      <th>navy</th>
      <td>9</td>
      <td>1</td>
      <td>3.321928</td>
    </tr>
    <tr>
      <th>scientific</th>
      <td>6</td>
      <td>2</td>
      <td>2.321928</td>
    </tr>
    <tr>
      <th>visualization</th>
      <td>9</td>
      <td>4</td>
      <td>1.321928</td>
    </tr>
    <tr>
      <th>and</th>
      <td>50</td>
      <td>9</td>
      <td>0.152003</td>
    </tr>
    <tr>
      <th>virtual</th>
      <td>5</td>
      <td>1</td>
      <td>3.321928</td>
    </tr>
    <tr>
      <th>reality</th>
      <td>5</td>
      <td>1</td>
      <td>3.321928</td>
    </tr>
    <tr>
      <th>seminar</th>
      <td>5</td>
      <td>1</td>
      <td>3.321928</td>
    </tr>
  </tbody>
</table>
## 计算 TFIDF 值


```python
idf = list(df['IDF'])
result = zeros_m*idf
result
```


    array([[ 2.32192809,  1.60964047, 16.60964047, ...,  0.        ,
             0.        ,  0.        ],
           [ 0.        ,  0.        ,  0.        , ...,  0.        ,
             0.        ,  0.        ],
           [ 0.        ,  0.32192809,  0.        , ...,  0.        ,
             0.        ,  0.        ],
           ...,
           [ 0.        ,  1.28771238,  0.        , ...,  0.        ,
             0.        ,  0.        ],
           [ 2.32192809,  1.60964047,  0.        , ...,  0.        ,
             0.        ,  0.        ],
           [ 0.        ,  0.32192809,  0.        , ...,  3.32192809,
             3.32192809,  3.32192809]])

## 使用 SKlearn 计算 TFIDF 值


```python
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer

vectorizer = CountVectorizer()
transformer = TfidfTransformer()

tfidf = transformer.fit_transform(vectorizer.fit_transform(files_))
word = vectorizer.get_feature_names()
print(word[40:50])
weight = tfidf.toarray().T
print(weight)

```

    ['accepted', 'accessible', 'across', 'add', 'address', 'addresses', 'adresses', 'advance', 'advises', 'affiliated']
    [[0.         0.11537929 0.         ... 0.         0.         0.        ]
     [0.03906779 0.         0.         ... 0.         0.         0.        ]
     [0.         0.         0.         ... 0.         0.         0.        ]
     ...
     [0.         0.         0.         ... 0.         0.         0.        ]
     [0.         0.         0.15731715 ... 0.04130626 0.09597341 0.05024117]
     [0.         0.         0.         ... 0.         0.11918574 0.        ]]


## 计算余弦相似度


```python
from sklearn.metrics.pairwise import cosine_similarity

test = weight[0]  # 假设其他的一篇文档就是第一篇文档
cos_sim = []
for i in range(len(weight)):
	cos_sim.append(cosine_similarity([list(test),list(weight[i])]))

print(cos_sim[0]) #第一行的值是 a1 中的第一个行向量与 a2 中所有的行向量之间的余弦相似度
print(cos_sim[5])
```

    [[1. 1.]
     [1. 1.]]
    [[1. 0.]
     [0. 1.]]

