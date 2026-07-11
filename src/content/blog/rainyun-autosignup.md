---
title: '雨云自动签到&自动积分续期 脚本'
description: '雨云全自动签到与积分续期脚本，教你零成本无限白嫖游戏云服务器。'
pubDate: 2024-08-27T14:27:00+08:00
cover:
  tone: ocean
  label: '软件技术'
  url: 'https://bu.dusays.com/2024/08/27/66cd84e1d31d8.webp'
  alt: '雨云自动签到&自动积分续期 脚本 的封面图'
draft: false
featured: false
category: '软件技术'
tags:
  - '羊毛白嫖'
author: 'Mystic Stars'
---

## ¶版权声明

本文为博客转载文章，原文为[HECODE](https://codezhangborui.com/)的[雨云自动签到脚本 & 自动积分续期脚本 - CodeZhangBorui's Blog](https://codezhangborui.com/2023/06/rainyun-autoscripts/)。

已经原作者许可，同时，我在此基础上做了细微修改。

## ¶写在前面

先放雨云注册链接（带aff）：[https://www.rainyun.com/mystic_](https://www.rainyun.com/mystic_)

使用本项目可以实现自动签到，每个月签到能拿9000积分。

游戏云是：`1元:400积分`

其他服务是：`1元:2000积分`

也就是说，月付不超过`22.5CNY`的游戏云都可以无限白嫖！

## ¶如何获取 X-API-KEY

打开[雨云账户设置](https://app.rainyun.com/account/settings)，点击左侧的【API 秘钥】，点击【重新生成】，复制即可。

## ¶雨云自动签到脚本

```
import requests
import json
import time

api_keys = [
    # 在这里放置 "<X-API-KEY>"，可放置多项
]
url = "https://api.v2.rainyun.com/user/reward/tasks"

print("Rainyun-AutoSignin-V2 script, by CodeZhangBorui\n[Time] ", end='')
print(time.ctime())

for key in api_keys:
    print("# 用 X-API-KEY 登录: " + key[:10] + "*" * 22)
    headers = {
        'x-api-key': key,
        'User-Agent': 'Rainyun-AutoSignin/2.0 (https://codezhangborui.eu.org/2023/06/rainyun-auto-python-scripts/)',
    }
    response = requests.request("GET", url, headers=headers, data={})
    result = json.loads(response.text)
    print("# 获取可领取任务列表")
    undone = []

    for task in result['data']:
        if task['Status'] == 0:
            print("## - 未完成：" + task['Name'])
        elif task['Status'] == 1:
            print("## > 可领取：" + task['Name'] + " | 可获得积分：" + str(task['Points']))
            undone.append(task['Name'])
        elif task['Status'] == 2:
            print("## V 已领取：" + task['Name'])
        else:
            print("## ? 未知状态：" + task['Name'] + " | 服务器 DATA：" + str(task))

    # undone.append("每日签到")
    if not undone:
        print("# 没有可领取任务！")
    else:
        for task in undone:
            try:
                print("## 请求完成任务：" + task, end='')
                response = requests.request("POST", url, headers=headers, json={"task_name": task})
                result = json.loads(response.text)
                print(" | 服务器 DATA：" + str(result))
            except Exception:
                print(":( Something went wrong, retry in 10 seconds...")
                time.sleep(10)
                try:
                    print("## 请求完成任务：" + task, end='')
                    response = requests.request("POST", url, headers=headers, json={"task_name": task})
                    result = json.loads(response.text)
                    print(" | 服务器 DATA：" + str(result))
                except Exception:
                    print(":( Something went wrong, retry in 30 seconds...")
                    time.sleep(30)
                    try:
                        print("## 请求完成任务：" + task, end='')
                        response = requests.request("POST", url, headers=headers, json={"task_name": task})
                        result = json.loads(response.text)
                        print(" | 服务器 DATA：" + str(result))
                    except Exception:
                        print(":( Something went wrong, skip this task")
                        continue
            print("")

print("# 程序已结束！")
time.sleep(10)
```

Python

注意，请将第 6 行替换为对应账号的 X-API-KEY。例：

```
import time

api_keys = [
    "gkFW55tqfDUzm1jNx3nij3RYKFoWR213",
    "fw8WEDjNx3ntqfDUzij3RYK1oWR213Fm",
]
url = "https://api.v2.rainyun.com/user/reward/tasks"
```

Python

## ¶自动积分续期脚本

```
import requests
import json
import time
import datetime

instances = [
    # 在这里放置 ["<X-API-KEY>", "<产品ID>"]，可放置多项
]
url_getinfo = "https://api.v2.rainyun.com/product/rgs/{id}/"
url_renew = "https://api.v2.rainyun.com/product/point_renew"

# 一次续费的天数
duration_day = 7


def get_remaining_days(unix_timestamp):
    # 获取当前时间的 UNIX 时间戳
    current_timestamp = datetime.datetime.now().timestamp()
    # 将 UNIX 时间戳转换为 datetime 对象
    target_date = datetime.datetime.fromtimestamp(unix_timestamp)
    # 将当前时间的 UNIX 时间戳转换为 datetime 对象
    current_date = datetime.datetime.fromtimestamp(current_timestamp)
    # 计算两个日期之间的差异
    difference = current_date - target_date
    # 获取差异的天数部分
    return -difference.days


print("Rainyun-PointRenew-V1 script, by CodeZhangBorui\n[Time] ", end='')
print(time.ctime())

for instance in instances:
    key = instance[0]
    pid = instance[1]
    print("# 处理实例: API-KEY=" + key[:10] + "*" * 22 + ",产品ID=" + pid)
    headers = {
        'x-api-key': key,
        'User-Agent': 'Rainyun-AutoRenew/1.0 (https://codezhangborui.eu.org/2023/06/rainyun-auto-python-scripts/)',
    }
    response = requests.request("GET", url_getinfo.replace('{id}', pid), headers=headers, data={})
    result = json.loads(response.text)

    try:
        timestamp = result['data']['Data']['ExpDate']
    except Exception:
        print("! 当在获取剩余天数时出错\n")
        continue

    remaining_days = get_remaining_days(timestamp)
    if remaining_days > 7:
        print("## 服务器还剩 " + str(remaining_days) + " 天到期,无法用积分续费!\n")
        continue

    print("## 服务器还剩 " + str(remaining_days) + " 天到期,尝试续费... ", end='')
    try:
        response = requests.request(
            "POST",
            url_renew,
            headers=headers,
            json={"duration_day": duration_day, "product_id": int(pid), "product_type": "rgs"},
        )
        result = json.loads(response.text)
        print(" | 服务器 DATA:" + str(result))
    except Exception:
        print(":( Something went wrong, retry in 10 seconds...")
        time.sleep(10)
        try:
            response = requests.request(
                "POST",
                url_renew,
                headers=headers,
                json={"duration_day": duration_day, "product_id": int(pid), "product_type": "rgs"},
            )
            result = json.loads(response.text)
            print(" | 服务器 DATA:" + str(result))
        except Exception:
            print(":( Something went wrong, retry in 30 seconds...")
            time.sleep(30)
            try:
                response = requests.request(
                    "POST",
                    url_renew,
                    headers=headers,
                    json={"duration_day": duration_day, "product_id": int(pid), "product_type": "rgs"},
                )
                result = json.loads(response.text)
                print(" | 服务器 DATA:" + str(result))
            except Exception:
                print(":( Something went wrong, skip this task")
                continue

print("# 程序已结束!")
time.sleep(10)
```

Python

注意，请将第 7 段替换为对应账号的 X-API-KEY 和产品 ID。例：

```
import datetime

instances = [
    ["gkFW55tqfDUzm1jNx3nij3RYKFoWR213", '32312'],
]
url_getinfo = "https://api.v2.rainyun.com/product/rgs/{id}/"
url_renew = "https://api.v2.rainyun.com/product/point_renew"
```
