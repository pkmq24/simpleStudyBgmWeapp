import eyed3

#!/usr/bin/python
#coding=utf-8

import requests
import hashlib

# TODO: 请根据需要，换成您的HOST，app_key和app_secrect
API_URL     = 'https://puluter.cn/server.php'
APP_KEY     = '6EC14C1A2BD1952E71390CFCB082858F'
APP_SECRET  = 'NKBLMzQvJMahGKFihN9fkL7a8vXAvyZBonqYFaxqnsSlHr7ECiB0BkDMpLT4'

# 生成签名
def Signature(params, key=None, secret=None):
    key = key or APP_KEY
    secret = secret or APP_SECRET
    params.pop('app_secrect', None)
    params['app_key'] = key
    md5_ctx = hashlib.md5()
    md5_ctx.update(''.join([params[value] for value in sorted([key for key in params])]) + secret)
    return md5_ctx.hexdigest().upper()


# 请求果创云开放接口
def HTTPGet(url, params):
    resp = requests.get(url, params)
    return resp.json()


def create(title,link):
    # 待请求的接口与相关参数
    params = {'s': 'App.Table.Create', 'model_name': 'bgmList', 'data': '{"music_name":"'+title+'","music_src":"'+link+'"}'}
    # 发起请求
    return HTTPGet(API_URL, params)

import os
path = "./mp3s"
listt = os.listdir(path)
import urllib.parse
for name in listt:
  audiofile = eyed3.load(path+"/"+name)
  title = audiofile.tag.title
  link = "https://bianlun.chat/"+urllib.parse.quote(name)
  print(title,link)
  print(create(title,link))
  # break