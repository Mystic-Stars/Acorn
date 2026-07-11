---
title: 'Vercel 加速，快，不止更快'
description: '突破 Vercel 境内访问瓶颈：自定义解析加速与缓存优化指南。'
pubDate: 2024-05-24T18:00:00+08:00
cover:
  tone: ocean
  label: '软件技术'
  url: 'https://bu.dusays.com/2024/05/25/6651745259320.png'
  alt: 'Vercel 加速，快，不止更快 的封面图'
draft: false
featured: false
legacyViews: 6276
category: '软件技术'
tags:
  - '网站'
author: 'Mystic Stars'
---

## **¶**版权声明

本文为博客转载文章，原文为[Fgaoxing](https://github.com/Fgaoxing)的[推一下 Vercel 加速节点 - Fgaoxing_Fgaoxing的个人博客 (yt-blog.top)](https://www.yt-blog.top/9952/)。

已经原作者许可，同时，我在此基础上做了细微修改。

## **¶**写在前面

Vercel 不仅可以部署 Hexo 博客，还能部署很多服务。

境内选择 Vercel 的站长很多，为了提升访问速度，自然选择了距离大陆最近的香港节点。

选的多了，节点压力自然就会增大，就算 Vercel
属于大平台，对陆带宽依旧有限，必然会出现互相影响的情况。

再加上滥用资源等问题出现，不少小伙伴反馈 Vercel 越来越慢。

今天为 Vercel 用户提供一个加速方案。

## **¶**食用方法

将原来解析至`cname.vercel.com`改为`vercel.cdn.yt-blog.top`

> 我没有图床所以直接复制杜老师的，但是注意，两个CNAME速度有差距，这个CNAME对应[https://vercel-cyfan.yt-blog.top/](https://vercel-cyfan.yt-blog.top/)，这主要是由于104.199.217.228只有电信快，18.162.37.140相对不稳定，但联通和移动快，大部分Vercel节点都是联通和移动快。vercel.cdn.yt-blog.top使用了更多的IP确保在一台出现问题后不会有太面积影响，但灵感来自vercel.cdn.cyfan.top

![图片](https://cdn.dusays.com/2024/01/669-1.jpg)图片

可访问[Vercel CDN (vercel.cdn.yt-blog.top)](https://vercel.cdn.yt-blog.top/)查看

## **¶**加速原理

Vercel
在大陆周围还有很多节点，其中包含中国台湾、韩国、日本、新加坡等，这些节点的访问延迟在接受范围，且相对香港节点来说带宽更充足。

Vercel 的 Anycast 会自动将节点解析至距离最近的香港服务器，但如果手动解析则太过麻烦。

`vercel.cdn.yt-blog.top`经过不断测速（大约消耗了200MB流量）手动解析，并通过 D
监控检查状态，无法访问时会及时暂停节点。使用时自动解析至附近可用节点，尽可能的选择优质节点。

这更加类似于CF自选IP，而不是真正的节点，节点IP基于Cyfan的[Vercel All IP (github.com)](https://gist.github.com/ChenYFan/fc2bd4ec1795766f2613b52ba123c0f8)

## **¶**更进一步

可以通过Vercel官方提供的缓存进行加速  
详细请看：[https://vercel.com/docs/edge-network/caching#cdn-cache-control](https://vercel.com/docs/edge-network/caching#cdn-cache-control)

静态网站参考本博客，在根目录放置vercel.json

```
{
 "headers": [
 {
 "source": "/sw.js",
 "headers": [
 {
 "key": "Cache-Control",
 "value": "public, max-age=0, must-revalidate"
 }
 ]
 },
 {
 "source": "(.*)",
 "headers": [
 {
 "key": "Cache-Control",
 "value": "public, s-maxage=86400, max-age=86400"
 }, {
 "key": "Vercel-CDN-Cache-Control",
 "value": "max-age=31536000"
 }
 ]
 }
 ]
}
```

Vercel在部署时会自动刷新缓存，静态网站缓存可以拉到无限长，动态网站缓存按实际需要。

如果你是静态网站，可以直接无脑复制粘贴此内容，不需要改任何配置。

## **¶**测速截图

测速工具（节点很多，非常推荐）：[https://zhale.me/http/](https://zhale.me/http/)

![](https://bu.dusays.com/2024/05/24/66506514bb08c.png)测速图片（GHS官网 https://www.ghs.red）

## **¶**问题反馈

[https://github.com/Fgaoxing/Vercel-CDN](https://github.com/Fgaoxing/Vercel-CDN)

我们无法觉得谁使用了CNAME，所以也有一些人通过解析我们CNAME的方式建立自己的Vercel
CDN(我给他个面子，不在这里说了)，但多次CNAME会导致速度变慢，如果有人给你发送一张对比图说他的测速比我这个快，大概是因为我这个有宣传页面，所以网站测速比不上Vercel的404
