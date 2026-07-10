---
title: '【APIKey福利】🔥 Thunderbird 邮件翻译最强攻略！沉浸式翻译移植 + 硅基流动AI翻译！'
description: '雷鸟邮件客户端最佳翻译方案：沉浸式翻译插件移植版安装与配置教程。'
pubDate: 2024-12-14T12:00:00+08:00
cover:
  tone: ocean
  label: '软件技术'
  url: 'https://bu.dusays.com/2024/12/14/675d151ee196e.webp'
  alt: '【APIKey福利】🔥 Thunderbird 邮件翻译最强攻略！沉浸式翻译移植 + 硅基流动AI翻译！ 的封面图'
draft: false
featured: false
category: '软件技术'
tags:
  - '软件分享'
  - '羊毛白嫖'
  - 'Thunderbird'
author: 'Mystic Stars'
---

> SiliconFlow注册链接（带AFF）：[https://cloud.siliconflow.cn/i/PGnHdyG0](https://cloud.siliconflow.cn/i/PGnHdyG0)
>
> 沉浸式翻译移植原文帖子：[https://linux.do/t/topic/285525](https://linux.do/t/topic/285525)
>
> 沉浸式翻译提示词原文帖子：[https://linux.do/t/topic/229713](https://linux.do/t/topic/229713)
>
> 沉浸式翻译官方仓库：[https://github.com/immersive-translate/immersive-translate](https://github.com/immersive-translate/immersive-translate)
>
> Thunderbird下载：[https://www.thunderbird.net/zh-CN/thunderbird/all/](https://www.thunderbird.net/zh-CN/thunderbird/all/)

## 前言

[雷鸟Thunderbird](https://www.thunderbird.net/)是一款免费的开源电子邮件客户端软件，由Mozilla基金会开发，也是我个人一直在使用的一款邮件聚合客户端。

Thunderbird哪里都好，但是它的`邮件翻译`功能一直不尽人意

![](https://bu.dusays.com/2024/12/13/675c4592be6ee.png)

可以看到，在官方的附加组件中没有一个好用的翻译插件，这也成了很多人宁愿承受广告而也要更换为`网易邮箱大师`等客户端的原因。

但是最近在冲浪的时候，我偶然发现了[Linux.do](Linux.do)社区一位佬友将[沉浸式翻译](https://immersivetranslate.com/)插件移植到了雷鸟中，在经过一周左右的使用后，我发现其适配效果异常好，双语翻译更是遥遥领先于QQ邮箱、网易邮箱等客户端，所以将本篇教程分享给大家。

> [移植“沉浸式翻译”到Thunderbird实现邮件翻译 - 开发调优 - LINUX DO](https://linux.do/t/topic/285525)
>
> 本文章“自己动手”部分转载自上述原帖，已征得作者同意发布

## 实现原理

由于`Thunderbird`和`Firefox`都基于相同的 Gecko 内核，它们的 API
有很高的兼容性，大大简化了移植工作。不过由于沉浸式翻译是一个`闭源项目`，仅仅只对必要的功能进行修改。

如果你想要更高的`自主性`和`安全性`，你可以在跳转到[自己动手](#自己动手)部分

如果你需要更`方便的安装`，你可以跳转到[一键安装](#一键安装)部分

## 自己动手

首先下载沉浸式翻译官方的Firefox插件包

[https://github.com/immersive-translate/immersive-translate/releases/download/v1.12.2/firefox-immersive-translate-1.12.2.zip](https://github.com/immersive-translate/immersive-translate/releases/download/v1.12.2/firefox-immersive-translate-1.12.2.zip)

对其进行解压缩

### 第一步：注入JS

向 background.js 中的主体代码添加以下代码注入 js：

```
async function registerMsgDisplayScript() {
 await messenger.messageDisplayScripts.register({
 js: [{file: "/content_script.js"}, {file: "/content_start.js"}]
 });
 }
 registerMsgDisplayScript();
```

### 第二步：修改 manifest.json

1. permissions  
   修改 "contextMenus" 为 "menus"（右键菜单相关），添加 "messagesModify"
   权限（实现邮件翻译的核心权限）。
2. browser_specific_settings  
   由于第一步中 messageDisplayScripts 的 API 从 Thunderbird 78
   开始支持，所以 "strict_min_version" 最低版本理论上为 78.0。

### 第三步：修改右键菜单相关 API（可选）

（如果不需要右键菜单翻译的功能，可以跳过此步。）

- 重命名 background.js 和 options.js 中所有调用名为 "contextMenus" 的 API 为 "menus"
- 删除 background.js 中列表 "[“browser_action”, “page_action”]“中的"page_action”（该 ContextType
  适用于 Firefox，而 Thunderbird 中无），否则无法创建右键菜单。

完整的修改可以参考这个[commit](https://github.com/immersive-translate/immersive-translate/commit/af70f1edad53f4e28d97cf9708f45c730616dfdb#diff-ca926259d0aac071cde2dd5ccba8c33937de52af847bf48004fc0aa39fc99664L166)  
修改完后直接打包`manifest.json`所在目录的所有文件为 zip，即可通过 Thunderbird 扩展页右上角的齿轮图标安装插件了

## 一键安装

> 请注意，本版本也许`不会支持后续更新`，故沉浸式翻译有更新时建议前往[自己动手](#自己动手)部分自行操作

### 第一步：下载并安装插件

下载链接：[https://github.com/John-Wong/immersive-translate/releases/download/v1.11.7-tb/thunderbird-immersive-translate-1.11.7.xpi](https://github.com/John-Wong/immersive-translate/releases/download/v1.11.7-tb/thunderbird-immersive-translate-1.11.7.xpi)  
点击上述链接下载已经修改好的`雷鸟适配版沉浸式翻译`插件

打开雷鸟的`拓展与主题`界面，安装插件

![](https://bu.dusays.com/2024/12/14/675d1aa1e020a.png)

![](https://bu.dusays.com/2024/12/14/675d1ae07b07e.png)

### 第二步：完成插件引导和基础设置

![](https://bu.dusays.com/2024/12/14/675d1b0d9c78f.png)

根据沉浸式翻译的内置提示完成初次使用的引导

![](https://bu.dusays.com/2024/12/14/675d1b56baa8f.png)

Tips：在此处由于 Thunderbird 置顶的扩展图标在除邮件页外的第三方页面中`不可见`，所以可以点击页面右侧的`悬浮窗`或使用默认快捷键`Alt+A`翻译，进而完成引导。

![](https://bu.dusays.com/2024/12/14/675d1bf19482c.png)

登录你的沉浸式翻译账号，至此，大功告成！🎉🎉🎉

![](https://bu.dusays.com/2024/12/14/675d1c2476f41.png)

## 进阶配置

### 第一步：配置自己的硅基流动密钥

沉浸式翻译内置了很多翻译引擎，而真正吸引我的是其高度的自定义性，其适配很多`大模型翻译`的接口，在这里我给大伙安利[硅基流动（SiliconFlow）](https://cloud.siliconflow.cn/i/PGnHdyG0)这一服务。

![](https://bu.dusays.com/2024/12/14/675d1db0a7692.png)

[硅基流动（SiliconFlow）](https://cloud.siliconflow.cn/i/PGnHdyG0)是一家专注于GenAI（生成式人工智能）技术的公司，其`免费`提供了一些开源大模型，如Qwen2.5-Coder-7B-Instruct等模型。

沉浸式翻译和[SiliconCloud](https://siliconflow.cn/)合作提供的免费大模型翻译

![](https://bu.dusays.com/2024/12/14/675d1df8dc447.png)

但是为了更好的翻译体验，我们可以自己注册硅基流动账号，获得`14元`人民币的赠金，使用更高级的模型进行翻译操作。

注册链接（带AFF）：[https://cloud.siliconflow.cn/i/PGnHdyG0](https://cloud.siliconflow.cn/i/PGnHdyG0)

![](https://bu.dusays.com/2024/12/14/675d1f22283e3.png)

接下来在控制台中`获取API 密钥`即可

![](https://bu.dusays.com/2024/12/14/675d200f2b1d8.png)

接下来填入沉浸式翻译中即可

> 如果大家不想自己动手，可以使用我分享的自己的一个14¥密钥，欢迎大家使用体验~
>
> `sk-hbwfquuupfnrwdvxywovunrkeoywxjuryhyfwuzmjypbrlti`

### 第二步：选择适当模型并更改系统提示词

关于模型方面，我推荐使用阿里推出的开源模型`Qwen/Qwen2.5-72B-Instruct`，将其填写至沉浸式翻译的配置中。

![](https://bu.dusays.com/2024/12/14/675d213a91edd.png)

沉浸式翻译中自带的AI提示词并不好用，不能够完全发挥出AI的实力。所以这里我顺便分享一份自用的沉浸式翻译`AI提示词`（以下内容为转载，来源：[https://linux.do/t/topic/229713](https://linux.do/t/topic/229713)）

- System Prompt

```
You are a translation expert, and your task is to translate the text provided by the user from {{from}} to {{to}}. Before translating, carefully analyze the user's text and connect it to your vast knowledge base to identify the most relevant field: avoid literal translations of specialized terminology to make the translation more professional. When translating, imagine {{to}} is your native language: flexibly use the grammar and vocabulary of {{to}} to make the translation more authentic. Finally, make your translation as fluent, smooth, natural, and elegant as possible. (You may make appropriate adjustments to the original sentence to generate better translation results.)
```

- Prompt

```
Translate the following source text, Output translation directly without any additional text.

Source Text: {{text}}
```

- Multiple Prompt

````
You will be given a YAML formatted input containing entries with "id" and "{{imt_source_field}}" fields. Here is the input:

```yaml
{{yaml}}
```

For each entry in the YAML, translate the contents of the "{{imt_source_field}}" field, Write the translation back into the "{{imt_source_field}}" field for that entry.

Here is an example of the expected format:

User Input:

```yaml
- id: 1
 {{imt_source_field}}: ...
- id: 2
 {{imt_source_field}}: ...
```

Your Output:

```yaml
- id: 1
 {{imt_trans_field}}: ...
- id: 2
 {{imt_trans_field}}: ...
```

Please return the translated YAML directly without any additional information.
````

- Subtitle Prompt

````
You will be given a YAML formatted subtitles containing entries with "id" and "{{imt_sub_source_field}}" fields. Here is the input:

```yaml
{{yaml}}
```

For each entry in the YAML, translate the contents of the "{{imt_sub_source_field}}" field, Write the translation back into the "{{imt_sub_trans_field}}" field for that entry.

Here is an example of the expected format:

User Input:

```yaml
- id: 1
 {{imt_sub_source_field}}: ...
- id: 2
 {{imt_sub_source_field}}: ...
```

Your Output:

```yaml
- id: 1
 {{imt_sub_trans_field}}: ...
- id: 2
 {{imt_sub_trans_field}}: ...
```

Please return the translated YAML directly without any additional information.
````

![](https://bu.dusays.com/2024/12/14/675d22adb6a91.png)

配置示例图片

## 结束语

好啦，本篇教程到这里就结束啦~如果还有任何疑问，欢迎在评论区进行询问！

总之，谢谢你的观看🙏
