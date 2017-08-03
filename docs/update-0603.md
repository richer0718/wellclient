# 1. 主要更新内容
- 不在使用websocket-support.min.js 改使用 stomp.min.js
- 使用原生websocket，避免出现ajax轮训的方式
- 修改直接使用分机拨号，软电话状态不正常的问题

# 2. 具体更改方式

在软电话的html页面引入以下文件

```
<link rel="stylesheet" href="public/css/well-client.css">
<script src="public/js/jquery-1.11.3.min.js"></script> // jquery 可以用你们自己的
<script src="https://mbtpi.wellcloud.cc/phone/public/js/stomp.min.js"></script>
<script src="https://mbtpi.wellcloud.cc/phone/public/js/well-client.js"></script>
<script src="https://mbtpi.wellcloud.cc/phone/public/js/well-client-ui.js"></script>
```

# 3. 详细说明
## 3.1 为什么不使用websocket-support.min.js?

websocket-support.min.js实际上是两个js文件压缩合并到一起的，其中包括

- `sockjs.js`: SockJS 是一个浏览器上运行的 JavaScript 库，如果浏览器不支持 WebSocket，该库可以模拟对 WebSocket 的支持，实现浏览器和 Web 服务器之间低延迟、全双工、跨域的通讯通道。
- `stomp.js`: STOMP即Simple (or Streaming) Text Orientated Messaging Protocol，简单(流)文本定向消息协议，它提供了一个可互操作的连接格式，允许STOMP客户端与任意STOMP消息代理（Broker）进行交互。STOMP协议由于设计简单，易于开发客户端，因此在多种语言和多种平台上得到广泛地应用。

但是我们发现，在IE11下（IE11支持原生WebSocket），Sockjs并没有使用原生WebSocket, 而是使用了ajax轮询的方式来模拟WebSocket而且经常缺少事件。
所以我们决定：**使用原生WebSocket, 不使用SockJS来做一层垫片。**（这个仅在IE11下支持，11之前的版本，必须升级到IE11才能使用）

## 3.2 直接使用分机拨号，会为什么会导致页面上的软电话状态不对?

直接使用分机拨号，相比于在页面上点击拨号，会缺少一些事件。而js在这些事件上注册了一些业务逻辑，缺少这部分事件会导致软电话状态不对。
现在去除对于这些事件的依赖。


孙航目前一共给我发来三个问题：

1、(已解决): 坐席登入后点击登出按钮能登出成功，但后台报错，再次点击登入按钮无法登入并报错
> 这个问题是由于枫树浏览器和谷歌浏览器WebSocket断开后的机制不一致导致的，已经做了兼容

2、(已解决): 拨打电话过程中坐席可以点击迁出按钮进行迁出，但通话未挂断，再次登入并拨打电话后台报错；
> 这个已经做了限制，只要座席处于振铃状态，座席签出时会给出提示信息，然后拒绝签出。

3、（暂时无法解决): 点击拨打但未拨打拨打请求过程中(时间较短)，仍可以迁出，并出现2所述问题（第二个问题解决之后发现）；
> 这个座席从电话呼出，到页面收到振铃时间之间，会有一端非常短的间隔。在这段时间内，如果座席签出。页面由于这时候还没收到振铃事件，所以
座席并没有进入通话状态，所以不能拒绝座席签出。这个问题并不会严重影响座席使用。

如果有任何其他问题，麻烦请及时给我反馈。我这边很快就可以处理。