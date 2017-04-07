[TOC]

## -1 分支说明
- **master**: 改动最大的分支，不稳定，用于定制化
- **basic**: 提供基础的接口和界面

## 0 运行项目
直接用浏览器打开根目录下的index.html。或者你也可以访问[在线的demo](http://wangduanduan.coding.me/wellClient/)

然后在浏览器里打开： 可以看到如下basic分支的界面。
![image](./public/img/demo2.jpg)


## 1 依赖项
`以下依赖项是必须的，并且必须按照指定的顺序加载`

1. jquery-1.11.3.min.js：建议使用不低于1.11.3版本的jquery
2. websocket-suport.min.js: websocket的支持组件
3. well-client.js: 软电话主要的逻辑处理
4. well-client-ui.js: 软电话的UI事件

`Example:`
```
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="public/css/well-client.css">
  <script src="public/js/jquery-1.11.3.min.js"></script>
  <script src="public/js/websocket-suport.min.js"></script>
  <script src="public/js/well-client.js"></script>
  <script src="public/js/well-client-ui.js"></script>
</head>
```

## 2 wellClient方法说明
### 2.1 wellClient.setConfig(config)：设置配置信息

config是js对象，具有以下字段

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
debug | boolean | 否 | true | debug模式会写详细的日志信息，设置成false可以关闭日志
SDK | string | 是 | 'tpisdk.wellcloud.cc' | 呼叫控制和事件服务的地址,80端口可不写
SDKPort | string | 是 | '' | 呼叫控制和事件服务的端口号,‘域名+端口’,80端口可不写
TPI | string | 是 | 'tpi.wellcloud.cc/login' | TPI 登录地址，'域名+端口+登录路径'
useWsLog | boolean | 否 | true | 是否输出详细的websocket信息
clickCallClass | string | 否 | well-canBeCalled | 设置点击呼叫的类,例如某个span标签包裹一串数字“8001sd12”,当这个类被点击的时候，首先会把这个字符串里的非数字部分剔除，然后对数字部分800112拨号。
hideButton | array | 否 |　［］| 设置隐藏某个按钮。例如['sConf','conf']，代表隐藏单步会议与会议按钮,
enableAlert | boolean | 否 | false | 决定是否启用alert。如果是ture，那么某些异常会用alert的形式弹出。默认不使用alert提示错误信息。

`Example`

```
wellClient.setConfig({host:'192.168.2.233',debug:false});
```

控件与id对应关系

名称 | id
--- | ---
设置坐席状态 | setMode
号码输入框 | number
拨号按钮 | make
接听按钮 | answer
保持按钮 | hold
单步转移按钮 | sTran
单步会议按钮 | sConf
咨询按钮 | ask
会议按钮 | conf
挂断按钮 | dropCon
登出按钮 | logout
登录按钮 | login

### 2.2 wellClient.login(jobNumber, password, domain, ext, loginMode)：坐席登录

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
jobNumber | string | 是 |  | 工号
password | string | 是 |  | 密码
domain | string | 是 |  | 域名
ext | string | 是 |  | 分机号
loginMode | string | 否 | 'ask' | 登录模式。ask: 询问过后决定是否登录；force: 强制登录，无需询问；stop: 不做处理。以上三种情况必须是座席忘记登出或者异地登录时才会起作用。其他情况的报错将直接报错，不做任何处理。

`Example`

```
wellClient.login('5001','123456','test.com','8001')
.done(function(res){
	console.log('登录成功');
})
.fail(function(res){
	console.log('登录失败');
});
```

### 2.3 wellClient.logout()：坐席登出

`Example`

```
wellClient.logout()
.done(function(res){
	console.log('登出成功');
})
.fail(function(res){
	console.log('登出失败');
})
```

### 2.4 wellClient.setAgentMode(mode)：设置坐席状态

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
mode | string | 是 |  | 'Ready'(就绪)，'NotReady'(未就绪)

`Example`

```
wellClient.setAgentMode('Ready')
.done(function(res){
	console.log('就绪成功');
})
.fail(function(res){
	console.log('就绪失败');
})
```

### 2.5 wellClient.makeCall(phoneNumber)：拨打电话

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
phoneNumber | string | 是 |  | 被叫方号码

`Example`

```
wellClient.makeCall('8007')
.done(function(res){
	console.log('拨号请求成功');
})
.fail(function(res){
	console.log('拨号请求失败');
})
```

### 2.6 wellClient.answerCall(callId)：接听电话

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 接听电话的callId

`Example`

```
wellClient.answerCall('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f')
.done(function(res){
	console.log('接听请求成功');
})
.fail(function(res){
	console.log('接听请求失败');
})
```

### 2.7 wellClient.dropConnection(callId)：挂断链接

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 电话的callId

`Example`

```
wellClient.dropConnection('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f')
.done(function(res){
	console.log('挂断链接请求成功');
})
.fail(function(res){
	console.log('挂断链接请求失败');
})
```

### 2.8 wellClient.holdCall(callId)：保持电话

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 电话的callId

`Example`

```
wellClient.holdCall('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f')
.done(function(res){
	console.log('保持链接请求成功');
})
.fail(function(res){
	console.log('保持链接请求失败');
})
```

### 2.9 wellClient.retrieveCall(callId)：取回电话

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 电话的callId

`Example`

```
wellClient.retrieveCall('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f')
.done(function(res){
	console.log('取回链接请求成功');
})
.fail(function(res){
	console.log('取回链接请求失败');
})
```

### 2.10 wellClient.singleStepTransfer(callId,phoneNumber)：单步转移

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 电话的callId
phoneNumber | string | 是 |  | 转移给另一方的电话号码

`Example`

```
wellClient.singleStepTransfer('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f','8002')
.done(function(res){
    console.log('单步转移请求成功');
})
.fail(function(res){
    console.log('单步转移请求失败');
})
```

### 2.11 wellClient.singleStepConference(callId,phoneNumber,type)：单步会议

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 电话的callId
phoneNumber | string | 是 |  | 邀请参与会议方的电话号码
type | string | 否 | Active | 邀请参与会议方的参与方式，可用Active, 或者Silent两种方式

`Example`

```
wellClient.singleStepConference('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f','8002')
.done(function(res){
    console.log('单步会议请求成功');
})
.fail(function(res){
    console.log('单步会议请求失败');
})
```

### 2.12 wellClient.consult(holdCallId,phoneNumber)：咨询

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 咨询方电话的callId
phoneNumber | string | 是 |  | 被咨询方的电话号码

`Example`

```
wellClient.consult('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f','8002')
.done(function(res){
    console.log('咨询请求成功');
})
.fail(function(res){
    console.log('咨询请求失败');
})
```

### 2.13 wellClient.conference(holdCallId, consultCallId)：会议

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 保持方的callId
consultCallId | string | 是 |  | 被咨询方callId

`Example`

```
wellClient.conference('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f','6aee1dda-d4a2-4d3c-8fab-df7782a6c10c')
.done(function(res){
    console.log('会议请求成功');
})
.fail(function(res){
    console.log('会议请求失败');
})
```

### 2.14 wellClient.cancelConsult(holdCallId, consultCallId)：取消咨询

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
holdCallId | string | 是 |  | 保持的callId
consultCallId | string | 是 |  | 咨询的callId

`Example`

```
wellClient.conference('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f','6aee1dda-d4a2-4d3c-8fab-df7782a6c10c')
.done(function(res){
    console.log('取消咨询请求成功');
})
.fail(function(res){
    console.log('取消咨询请求失败');
})
```

### 2.15 wellClient.transferCall(holdCallId, consultCallId)：咨询后转移

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
holdCallId | string | 是 |  | 保持的callId
consultCallId | string | 是 |  | 咨询的callId

`Example`

```
wellClient.conference('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f','6aee1dda-d4a2-4d3c-8fab-df7782a6c10c')
.done(function(res){
    console.log('咨询后转移请求成功');
})
.fail(function(res){
    console.log('咨询后转移请求失败');
})
```

### 2.16 wellClient.setCallData(callId, data)：设置随路数据

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | callId
data | array | 是 |  | 对象数组。形式必须符合：[{key:'agentId', value:'8001'},{key:'customerId', value:'19099092'}]

`Example`

```
var data = [{key:'agentId', value:'8001'},{key:'customerId', value:'19099092'}];

wellClient.setCallData('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f',data)
.done(function(res){
	console.log('设置随路数据成功');
})
.fail(function(res){
	console.log('设置随路数据失败');
})
```


## 3 事件处理

### 3.1 wellClient.on(eventName,callback):事件订阅函数

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
eventName | string | 是 |  | 必须是合法的事件名称
callback | function | 是 |  | 事件的回调函数

`Example`

```
// 订阅服务初始化事件
wellClient.on('serviceInitiated',function(data){
    wellClient.log('事件处理-服务初始化');
});
```

### 3.2 wellClient.exports=function(event){}: 所有事件的回调函数
第三方自行实现这个函数后，一旦收到事件，就会调用这个函数。

```
wellClient.exports = function(event){
    console.log('receive event: >>>');
    console.log(event);
};
```
### 3.3 wellClient.onLog=function(msg){}: 所有日志的回调函数
msg结构

字段 | 类型 | 含义
--- | --- | ---
msg.type | 枚举('log', 'error', 'alert') | 消息类型
msg.content | string | 消息内容

第三方自行实现这个函数后，一旦收到打印日志事件，就会回调这个函数
```
wellClient.onLog = function(msg){
    console.log(msg.type);
    console.log(msg.content);
}
```

## 4 强制操作接口
### 4.1 wellClient.forceDrop(deviceId, callId): 强拆
> 强制通话中的设备挂断电话。必须保证被插入的设备在通话中才可以进行强拆。

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
deviceId | string | 是 |  | 设备id
callId | string | 是 |  | 呼叫id

`Example`

```
wellClient.forceDrop('8001@test.cc', '6aee1dda-d4a2-4d3c-8fab-df7782a6c10f')
.done(function(res){
    console.log('强拆请求成功');
})
.fail(function(res){
    console.log('强拆请求失败');
});
```

### 4.2 wellClient.forceJoin(deviceId, callId, phoneNumber): 强插
> 强制进入一个通话中，类似于进入会议。必须保证被插入的设备在通话中才可以进行强插。


参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
deviceId | string | 是 |  | 被插入设备的id
callId | string | 是 |  | 被插入设备的callId
phoneNumber | string | 是 |  | 插入方设备号码

`Example`

```
wellClient.forceJoin('8001@test.cc', '6aee1dda-d4a2-4d3c-8fab-df7782a6c10f', '8002')
.done(function(res){
    console.log('强插请求成功');
})
.fail(function(res){
    console.log('强插请求失败');
});
```

### 4.3 wellClient.forceTake(deviceId, callId, phoneNumber): 接管
> 接管通过的坐席，让通话转接到指定的设备上。必须保证被接管的设备在通话中才可以进行接管。

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
deviceId | string | 是 |  | 被接管设备的id
callId | string | 是 |  | 被接管设备的callId
phoneNumber | string | 是 |  | 接管方设备号码

`Example`

```
wellClient.forceTake('8001@test.cc', '6aee1dda-d4a2-4d3c-8fab-df7782a6c10f', '8002')
.done(function(res){
    console.log('强插请求成功');
})
.fail(function(res){
    console.log('强插请求失败');
});
```

### 4.4 wellClient.forceListen(callId, deviceId): 监听
> 监听通话。

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
callId | string | 是 |  | 被监听通话的callId
deviceId | string | 是 |  | 使用设备（deviceId）去监听

`Example`

```
wellClient.forceListen('6aee1dda-d4a2-4d3c-8fab-df7782a6c10f', '8002@test.cc')
.done(function(res){
    console.log('监听请求成功');
})
.fail(function(res){
    console.log('监听请求失败');
});
```

### 4.5 wellClient.forceReady(agentId, deviceId): 强制就绪

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
agentId | string | 是 |  | 座席Id
deviceId | string | 是 |  | 座席使用的设备Id

`Example`

```
wellClient.forceReady('5001@test.cc', '8002@test.cc')
.done(function(res){
    console.log('强制就绪请求成功');
})
.fail(function(res){
    console.log('强制就绪请求失败');
});
```


### 4.6 wellClient.forceNotReady(agentId, deviceId):强制离席

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
agentId | string | 是 |  | 座席Id
deviceId | string | 是 |  | 座席使用的设备Id

`Example`

```
wellClient.forceNotReady('5001@test.cc', '8002@test.cc')
.done(function(res){
    console.log('强制离席请求成功');
})
.fail(function(res){
    console.log('强制离席请求失败');
});
```


### 4.7 wellClient.forceLogout(agentId, deviceId): 强制签出
> 强制座席签出

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
agentId | string | 是 |  | 座席Id
deviceId | string | 是 |  | 座席使用的设备Id

`Example`

```
wellClient.forceLogout('5001@test.cc', '8002@test.cc')
.done(function(res){
    console.log('强制签出请求成功');
})
.fail(function(res){
    console.log('强制签出请求失败');
});
```


## 5 调试工具
### 5.1 wellClient.getCallMemory(): 获取wellClient内部数据

`Example`

```
wellClient.getCallMemory()
```

### 5.2 wellClient.log(msg): 输出日志信息

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
msg | string,object,array,... | 否 |  | 变量名

`Example`

```
wellClient.log('test');
```

### 5.3 wellClient.error(msg): 输出错误日志信息

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
msg | string,object,array,... | 否 |  | 变量名

`Example`

```
wellClient.error('test');
```

### 5.3 wellClient.setDebug(isDebug): 输出错误日志信息

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
isDebug | boolean | 是 |  | 变量名

`Example`

```
wellClient.setDebug(true);
```

### 5.4 wellClient.isPhoneNumber(phoneNumber): 判断字符串是否是合法的号码

参数 | 类型 | 是否必须 |  默认值 | 描述
---|---|---|---|---
phoneNumber | string | 是 |  | 变量名

`Example`

```
// 因为不仅仅有手机号，还有分机号，所以isPhoneNumber函数只是去验证传入的字符串是否全是数字
wellClient.isPhoneNumber('144124');
```

## 6 事件名及其数据结构
### 6.1 agentLoggedOn：坐席登录事件
`数据模型`
```
AgentLoggedOnEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	deviceId (string, optional): 分机号 ,
	agentId (string, optional): 坐席号 ,
	agentMode (string, optional): 坐席状态 = ['Ready', 'NotReady', 'WorkNotReady', 'Logout', 'Unknown'],
	devices (object, optional): 登录设备 ,
	queueId (string, optional): 队列ID ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}
```
`示例`
```
{
  "eventName": "agentLoggedOn",
  "eventTime": "2017.03.18 14:13:24",
  "eventType": "agent",
  "serial": 11050819,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.AgentLoggedOnEvent",
  "topics": [
    "CtiRouter_ctirouter-z40iv",
    "agent:5002@zhen04.cc",
    "agentLoggedOn",
    "agent:zhen04.cc",
    "device:8002@zhen04.cc",
    "agent",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "deviceId": "8002@zhen04.cc",
  "agentId": "5002@zhen04.cc",
  "agentMode": "Ready",
  "devices": {
    "Voice": "8002@zhen04.cc"
  }
}
```

### 6.2 agentLoggedOff：坐席登出事件
`数据模型`
```
AgentLoggedOffEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	deviceId (string, optional): 分机号 ,
	agentId (string, optional): 坐席号 ,
	agentMode (string, optional): 坐席状态 = ['Ready', 'NotReady', 'WorkNotReady', 'Logout', 'Unknown'],
	devices (object, optional): 登录设备 ,
	queueId (string, optional): 队列ID ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}
```
`示例`
```
{
  "eventName": "agentLoggedOff",
  "eventTime": "2017.03.18 14:35:34",
  "eventType": "agent",
  "serial": 11066842,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.AgentLoggedOffEvent",
  "topics": [
    "CtiRouter_ctirouter-z40iv",
    "agent:5002@zhen04.cc",
    "agentLoggedOff",
    "agent:zhen04.cc",
    "device:8002@zhen04.cc",
    "agent",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "deviceId": "8002@zhen04.cc",
  "agentId": "5002@zhen04.cc",
  "agentMode": "Logout",
  "devices": {
    "Voice": "8002@zhen04.cc"
  }
}
```
### 6.3 agentReady：坐席就绪事件
`数据模型`
```
AgentReadyEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	deviceId (string, optional): 分机号 ,
	agentId (string, optional): 坐席号 ,
	agentMode (string, optional): 坐席状态 = ['Ready', 'NotReady', 'WorkNotReady', 'Logout', 'Unknown'],
	devices (object, optional): 登录设备 ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}

```
`示例`
```
{
  "eventName": "agentReady",
  "eventTime": "2017.03.18 14:13:24",
  "eventType": "agent",
  "serial": 11050820,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.AgentReadyEvent",
  "topics": [
    "CtiRouter_ctirouter-z40iv",
    "agent:5002@zhen04.cc",
    "agentReady",
    "agent:zhen04.cc",
    "device:8002@zhen04.cc",
    "agent",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "deviceId": "8002@zhen04.cc",
  "agentId": "5002@zhen04.cc",
  "agentMode": "Ready",
  "devices": {
    "Voice": "8002@zhen04.cc"
  }
}
```
### 6.4 agentNotReady：坐席离席事件
`数据模型`
```
AgentNotReadyEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	deviceId (string, optional): 分机号 ,
	agentId (string, optional): 坐席号 ,
	agentMode (string, optional): 坐席状态 = ['Ready', 'NotReady', 'WorkNotReady', 'Logout', 'Unknown'],
	devices (object, optional): 登录设备 ,
	reason (string, optional): 离席原因 ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}
```
`示例`
```
{
  "eventName": "agentNotReady",
  "eventTime": "2017.03.18 14:33:50",
  "eventType": "agent",
  "serial": 11065578,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5006@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.AgentNotReadyEvent",
  "topics": [
    "CtiRouter_ctirouter-z40iv",
    "agent:5006@zhen04.cc",
    "agent:zhen04.cc",
    "device:8001@zhen04.cc",
    "agent",
    "agentNotReady",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8001@zhen04.cc",
  "deviceId": "8001@zhen04.cc",
  "agentId": "5006@zhen04.cc",
  "agentMode": "NotReady",
  "devices": {
    "Voice": "8001@zhen04.cc"
  }
}
```
### 6.5 serviceInitiated：摘机事件

摘机事件在makeCall时将会产生，这个事件只会由呼叫的发起方收到。

`数据模型`
```
ServiceInitiatedEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	callId (string, optional): 呼叫ID ,
	deviceId (string, optional): 发生变化的设备 ,
	localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
	agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
	originCallInfo (OriginCallInfo, optional),
	connectionId (string, optional),
	initiatedDevice (string, optional): 摘机设备 ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}
OriginCallInfo {
	callId (string, optional),
	callingDevice (string, optional),
	calledDevice (string, optional)
}
```
`示例`
```
{
  "eventName": "serviceInitiated",
  "eventSrc": "8001@zhen04.cc",
  "eventTime": "2017.03.18 14:13:33",
  "eventType": "csta",
  "serial": 121019,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5006@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.ServiceInitiatedEvent",
  "topics": [
    "extension",
    "agent:5006@zhen04.cc",
    "serviceInitiated",
    "CtiWorker_ctiworker-31dv7",
    "crossRefId:2365",
    "device:8001@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8001@zhen04.cc",
  "callId": "37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "deviceId": "8001@zhen04.cc",
  "localState": "Initiate",
  "connectionId": "8001@zhen04.cc|37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "initiatedDevice": "8001@zhen04.cc"
}
```
### 6.6 originated：呼出事件

呼出事件在makeCall时将会产生，与serviceInited事件一定是成对出现。

这个事件只会由呼叫的发起方收到。

`数据模型`
```
OriginatedEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	callId (string, optional): 呼叫ID ,
	deviceId (string, optional): 发生变化的设备 ,
	localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
	agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
	originCallInfo (OriginCallInfo, optional),
	connectionId (string, optional),
	callingDevice (string, optional): 主叫号 ,
	calledDevice (string, optional): 被叫号 ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}
OriginCallInfo {
	callId (string, optional),
	callingDevice (string, optional),
	calledDevice (string, optional)
}
```
`示例`
```
{
  "eventName": "originated",
  "eventSrc": "8001@zhen04.cc",
  "eventTime": "2017.03.18 14:13:33",
  "eventType": "csta",
  "serial": 121021,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5006@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.OriginatedEvent",
  "topics": [
    "extension",
    "agent:5006@zhen04.cc",
    "CtiWorker_ctiworker-31dv7",
    "crossRefId:2365",
    "device:8001@zhen04.cc",
    "csta",
    "originated"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8001@zhen04.cc",
  "callId": "37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "deviceId": "8001@zhen04.cc",
  "localState": "Initiate",
  "connectionId": "8001@zhen04.cc|37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "callingDevice": "8001@zhen04.cc",
  "calledDevice": "8002@zhen04.cc"
}
```
### 6.7 delivered：振铃事件

振铃事件在呼叫到达设备时产生，在呼叫中的每一个设备都会收到一个振铃事件。

下面是不同场景下设备收到事件的情况：

1. 对于单步会议场景来说，在呼叫中的每一个设备都会收到振铃事件，包括发起会议方，被会议方，以及第三方。

2. 对于单步转移场景来说，转移目的方与被转移方将收到振铃事件，而发起转移方因为呼叫结束将不再收到振铃事件。

3. 对于咨询后会议场景来说，发起会议方与被会议方将收到振铃事件，而被保持方则不会收到振铃事件。

4. 对于咨询后转移场景来说，发起转移方与转移目的方将收到振铃事件，而被保持方则不会收到振铃事件。

判断是否本设备的呼叫只需要关注alertingDevice与srcDeviceId相同，相同则表明当前设备在振铃。

`数据模型`
```
DeliveredEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	callId (string, optional): 呼叫ID ,
	deviceId (string, optional): 发生变化的设备 ,
	localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
	agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
	originCallInfo (OriginCallInfo, optional),
	connectionId (string, optional),
	alertingDevice (string, optional): 振铃设备 ,
	callingDevice (string, optional): 主叫设备 ,
	calledDevice (string, optional): 被叫设备 ,
	lastRedirectionDevice (string, optional): 最后一次从..转入的设备 ,
	trunkGroup (string, optional): 中继组号 ,
	trunkMember (string, optional): 中继号 ,
	originalCallId (string, optional): 原始呼叫ID ,
	userData (UserData, optional): 随路数据 ,
	split (string, optional): 队列 ,
	callCause (string, optional): 呼叫原因 ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}
OriginCallInfo {
	callId (string, optional),
	callingDevice (string, optional),
	calledDevice (string, optional)
}
UserData {}
```
`示例`
```
{
  "eventName": "delivered",
  "eventSrc": "8002@zhen04.cc",
  "eventTime": "2017.03.18 14:13:33",
  "eventType": "csta",
  "serial": 121027,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.DeliveredEvent",
  "topics": [
    "agent:5002@zhen04.cc",
    "extension",
    "delivered",
    "crossRefId:1951",
    "CtiWorker_ctiworker-31dv7",
    "device:8002@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "callId": "37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "deviceId": "8002@zhen04.cc",
  "localState": "Alerting",
  "connectionId": "8002@zhen04.cc|37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "alertingDevice": "8002@zhen04.cc",
  "callingDevice": "8001@zhen04.cc",
  "calledDevice": "8002@zhen04.cc"
}
```
### 6.8 established：接通事件

接通事件在通话建立时产生，在呼叫中的每一个设备都会收到一个接通事件。

下面是不同场景下设备收到事件的情况：

1. 对于单步会议场景来说，在呼叫中的每一个设备都会收到接通事件，包括发起会议方，被会议方，以及第三方。

2. 对于单步转移场景来说，转移目的方与被转移方将收到接通事件，而发起转移方因为呼叫结束将不再收到接通事件。

3. 对于咨询后会议场景来说，发起会议方与被会议方将收到接通事件，而被保持方则不会收到接通事件。

4. 对于咨询后转移场景来说，发起转移方与转移目的方将收到接通事件，而被保持方则不会收到接通事件。

判断是否本设备的应答了呼叫只需要关注answeringDevice与srcDeviceId相同，相同则表明当前设备在应答了呼叫。


`数据模型`
```
EstablishedEvent {
	eventName (string, optional): 事件名称 ,
	eventSrc (object, optional): 事件源 ,
	eventTime (string, optional): 事件时间 ,
	eventType (string, optional),
	serial (integer, optional): 序号 ,
	namespace (string, optional): 命名空间 ,
	srcDeviceId (string, optional): 订阅事件的设备 ,
	callId (string, optional): 呼叫ID ,
	deviceId (string, optional): 发生变化的设备 ,
	localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
	agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
	originCallInfo (OriginCallInfo, optional),
	connectionId (string, optional),
	answeringDevice (string, optional): 接通设备 ,
	callingDevice (string, optional): 主叫号 ,
	calledDevice (string, optional): 被叫号 ,
	trunkGroup (string, optional): 中继组 ,
	trunkMember (string, optional): 中继号 ,
	split (string, optional): 队列 ,
	userData (UserData, optional): 随路数据 ,
	sipCallId (string, optional): Sip 呼叫ID ,
	propertyNames (Array[string], optional),
	eventTopics (Array[string], optional)
}
OriginCallInfo {
	callId (string, optional),
	callingDevice (string, optional),
	calledDevice (string, optional)
}
UserData {}
```
`示例`
```
{
  "eventName": "established",
  "eventSrc": "8002@zhen04.cc",
  "eventTime": "2017.03.18 14:13:36",
  "eventType": "csta",
  "serial": 121037,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.EstablishedEvent",
  "topics": [
    "agent:5002@zhen04.cc",
    "extension",
    "crossRefId:1951",
    "CtiWorker_ctiworker-31dv7",
    "established",
    "device:8002@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "callId": "37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "deviceId": "8002@zhen04.cc",
  "localState": "Connect",
  "connectionId": "8002@zhen04.cc|37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "answeringDevice": "8002@zhen04.cc",
  "callingDevice": "8001@zhen04.cc",
  "calledDevice": "8002@zhen04.cc"
}
```
### 6.9 connectionCleared：呼叫挂断事件

> 标志一方从呼叫中挂断

在呼叫中的所有设备都会收到此事件。

在会议场景中，任意一方从会议中退出，会议中的其它方都会收到挂断事件。

在咨询转移场景中，发起转移方以及转移目的方将收到挂断事件。

当releasingDevice与srcDeviceId相同时，标识本设备从呼叫中挂断。

`数据模型`
```
```
`示例`
```
{
  "eventName": "connectionCleared",
  "eventSrc": "8002@zhen04.cc",
  "eventTime": "2017.03.18 14:14:15",
  "eventType": "csta",
  "serial": 121051,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.ConnectionClearedEvent",
  "topics": [
    "agent:5002@zhen04.cc",
    "extension",
    "crossRefId:1951",
    "CtiWorker_ctiworker-31dv7",
    "connectionCleared",
    "device:8002@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "callId": "37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "deviceId": "8002@zhen04.cc",
  "localState": "Queued",
  "connectionId": "8002@zhen04.cc|37db6efe-57cc-4053-b0ce-24c96eba66b0",
  "releasingDevice": "8002@zhen04.cc"
}
```
### 6.10 transferred：转移事件

标识呼叫已从本设备转移到目的设备，转移发起方将收到此事件。

`数据模型`
```
TransferredEvent {
    eventName (string, optional): 事件名称 ,
    eventSrc (object, optional): 事件源 ,
    eventTime (string, optional): 事件时间 ,
    eventType (string, optional),
    serial (integer, optional): 序号 ,
    namespace (string, optional): 命名空间 ,
    srcDeviceId (string, optional): 订阅事件的设备 ,
    callId (string, optional): 呼叫ID ,
    deviceId (string, optional): 发生变化的设备 ,
    localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
    agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
    originCallInfo (OriginCallInfo, optional),
    connectionId (string, optional),
    primaryOldCall (string, optional): 转移前被保持的呼叫 ,
    secondaryOldCall (string, optional): 转移前活动的呼叫 ,
    transferringDevice (string, optional): 发起转移的设备 ,
    transferredToDevice (string, optional): 转移的目标设备 ,
    newCall (string, optional): 转移后的呼叫ID ,
    propertyNames (Array[string], optional),
    eventTopics (Array[string], optional)
}
OriginCallInfo {
    callId (string, optional),
    callingDevice (string, optional),
    calledDevice (string, optional)
}
```
`示例`
```
{
  "eventName": "transferred",
  "eventSrc": "8002@zhen04.cc",
  "eventTime": "2017.03.18 14:39:31",
  "eventType": "csta",
  "serial": 121645,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.TransferredEvent",
  "topics": [
    "agent:5002@zhen04.cc",
    "extension",
    "transferred",
    "crossRefId:1951",
    "CtiWorker_ctiworker-31dv7",
    "device:8002@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "callId": "10549a5f-41c8-4309-a1ad-faa61c8f3777",
  "deviceId": "8002@zhen04.cc",
  "localState": "Queued",
  "originCallInfo": {
    
  },
  "connectionId": "8002@zhen04.cc|10549a5f-41c8-4309-a1ad-faa61c8f3777",
  "primaryOldCall": "0",
  "secondaryOldCall": "10549a5f-41c8-4309-a1ad-faa61c8f3777",
  "transferringDevice": "8002@zhen04.cc",
  "transferredToDevice": "8003@zhen04.cc",
  "newCall": "10549a5f-41c8-4309-a1ad-faa61c8f3777"
}
```

### 6.11  conferenced：会议事件

形成会议时产生此事件，在会议中的所有设备都将收到此事件。如果有新的设备加入到会议中，会议中的所有设备也将收到此事件。

`数据模型`
```
ConferencedEvent {
eventName (string, optional): 事件名称 ,
eventSrc (object, optional): 事件源 ,
eventTime (string, optional): 事件时间 ,
eventType (string, optional),
serial (integer, optional): 序号 ,
namespace (string, optional): 命名空间 ,
srcDeviceId (string, optional): 订阅事件的设备 ,
callId (string, optional): 呼叫ID ,
deviceId (string, optional): 发生变化的设备 ,
localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
originCallInfo (OriginCallInfo, optional),
connectionId (string, optional),
primaryOldCall (string, optional): 会议前的被保持的呼叫 ,
secondaryOldCall (string, optional): 会议前活动的呼叫 ,
conferencingDevice (string, optional): 发起会议的设备 ,
addedParty (string, optional): 加入会议的设备 ,
newCall (string, optional): 会议后新的呼叫ID ,
eventTopics (Array[string], optional),
propertyNames (Array[string], optional)
}
OriginCallInfo {
callId (string, optional),
callingDevice (string, optional),
calledDevice (string, optional)
}
```
`示例`
```
{
  "eventName": "conferenced",
  "eventSrc": "8001@zhen04.cc",
  "eventTime": "2017.03.18 14:15:37",
  "eventType": "csta",
  "serial": 121110,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5006@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.ConferencedEvent",
  "topics": [
    "extension",
    "agent:5006@zhen04.cc",
    "conferenced",
    "CtiWorker_ctiworker-31dv7",
    "crossRefId:2365",
    "device:8001@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8001@zhen04.cc",
  "callId": "b81b0af2-e40a-4e0e-a8ce-47be9474f245",
  "deviceId": "8003@zhen04.cc",
  "localState": "Connect",
  "connectionId": "8003@zhen04.cc|b81b0af2-e40a-4e0e-a8ce-47be9474f245",
  "primaryOldCall": "0",
  "secondaryOldCall": "b81b0af2-e40a-4e0e-a8ce-47be9474f245",
  "conferencingDevice": "8001@zhen04.cc",
  "addedParty": "8003@zhen04.cc",
  "newCall": "b81b0af2-e40a-4e0e-a8ce-47be9474f245"
}
```

### 6.12  retrieved：取回事件

呼叫从保持状态恢复到通话状态时产生的事件，呼叫中的所有设备都将收到此事件。

`数据模型`
```
RetrievedEvent {
eventName (string, optional): 事件名称 ,
eventSrc (object, optional): 事件源 ,
eventTime (string, optional): 事件时间 ,
eventType (string, optional),
serial (integer, optional): 序号 ,
namespace (string, optional): 命名空间 ,
srcDeviceId (string, optional): 订阅事件的设备 ,
callId (string, optional): 呼叫ID ,
deviceId (string, optional): 发生变化的设备 ,
localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
originCallInfo (OriginCallInfo, optional),
connectionId (string, optional),
retrievingDevice (string, optional): 取回设备 ,
sipCallId (string, optional): sip呼叫ID ,
propertyNames (Array[string], optional),
eventTopics (Array[string], optional)
}
OriginCallInfo {
callId (string, optional),
callingDevice (string, optional),
calledDevice (string, optional)
}
```
`示例`
```
{
  "eventName": "retrieved",
  "eventSrc": "8002@zhen04.cc",
  "eventTime": "2017.03.18 14:38:39",
  "eventType": "csta",
  "serial": 121578,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.RetrievedEvent",
  "topics": [
    "agent:5002@zhen04.cc",
    "extension",
    "crossRefId:1951",
    "CtiWorker_ctiworker-31dv7",
    "device:8002@zhen04.cc",
    "retrieved",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "callId": "10549a5f-41c8-4309-a1ad-faa61c8f3777",
  "deviceId": "8002@zhen04.cc",
  "localState": "Connect",
  "connectionId": "8002@zhen04.cc|10549a5f-41c8-4309-a1ad-faa61c8f3777",
  "retrievingDevice": "8002@zhen04.cc"
}
```

### 6.13  held：保持事件

呼叫一方被保持时收到的事件，呼叫中所有设备都将收到此事件。

`数据模型`
```
HeldEvent {
eventName (string, optional): 事件名称 ,
eventSrc (object, optional): 事件源 ,
eventTime (string, optional): 事件时间 ,
eventType (string, optional),
serial (integer, optional): 序号 ,
namespace (string, optional): 命名空间 ,
srcDeviceId (string, optional): 订阅事件的设备 ,
callId (string, optional): 呼叫ID ,
deviceId (string, optional): 发生变化的设备 ,
localState (string, optional): 事件发生后设备的状态 = ['Connect', 'Initiate', 'Alerting', 'Hold', 'None', 'Queued', 'Fail', 'Idle'],
agentStatus (string, optional): 坐席状态 = ['NotReady', 'WorkNotReady', 'Idle', 'OnCallIn', 'OnCallOut', 'Logout', 'Ringing', 'OffHook', 'CallInternal', 'Dailing', 'Ringback', 'Conference', 'OnHold', 'Other'],
originCallInfo (OriginCallInfo, optional),
connectionId (string, optional),
holdingDevice (string, optional): 保持设备 ,
propertyNames (Array[string], optional),
eventTopics (Array[string], optional)
}
OriginCallInfo {
callId (string, optional),
callingDevice (string, optional),
calledDevice (string, optional)
}
```
`示例`
```
{
  "eventName": "held",
  "eventSrc": "8002@zhen04.cc",
  "eventTime": "2017.03.18 14:37:57",
  "eventType": "csta",
  "serial": 121511,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5002@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.HeldEvent",
  "topics": [
    "agent:5002@zhen04.cc",
    "extension",
    "held",
    "crossRefId:1951",
    "CtiWorker_ctiworker-31dv7",
    "device:8002@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8002@zhen04.cc",
  "callId": "10549a5f-41c8-4309-a1ad-faa61c8f3777",
  "deviceId": "8002@zhen04.cc",
  "localState": "Hold",
  "connectionId": "8002@zhen04.cc|10549a5f-41c8-4309-a1ad-faa61c8f3777",
  "holdingDevice": "8002@zhen04.cc"
}
```

### 6.14  agentWorkingAfterCall：坐席话后处理事件
`数据模型`
```
AgentWorkingAfterCallEvent {
eventName (string, optional): 事件名称 ,
eventSrc (object, optional): 事件源 ,
eventTime (string, optional): 事件时间 ,
eventType (string, optional),
serial (integer, optional): 序号 ,
namespace (string, optional): 命名空间 ,
srcDeviceId (string, optional): 订阅事件的设备 ,
deviceId (string, optional): 分机号 ,
agentId (string, optional): 坐席号 ,
agentMode (string, optional): 坐席状态 = ['Ready', 'NotReady', 'WorkNotReady', 'Logout', 'Unknown'],
devices (object, optional): 登录设备 ,
eventTopics (Array[string], optional),
propertyNames (Array[string], optional)
}
```
`示例`
```
{
  "eventName": "agentWorkingAfterCall",
  "eventTime": "2017.03.24 17:53:55",
  "eventType": "agent",
  "serial": 11468024,
  "params": {
    "_amqpTopic": "event.csta.zhen04.cc",
    "agent": "5006@zhen04.cc",
    "subscriptionId": "http%3A%2F%2F172.20.1.113%3A58080%2Fevent-sink%2Fcsta%2Fzhen04.cc"
  },
  "_type": "component.cti.event.AgentWorkingAfterCallEvent",
  "topics": [
    "agent:5006@zhen04.cc",
    "agent:zhen04.cc",
    "CtiRouter_ctirouter-cmvnl",
    "agentWorkingAfterCall",
    "agent",
    "device:8005@zhen04.cc",
    "csta"
  ],
  "namespace": "zhen04.cc",
  "srcDeviceId": "8005@zhen04.cc",
  "deviceId": "8005@zhen04.cc",
  "agentId": "5006@zhen04.cc",
  "agentMode": "WorkNotReady",
  "devices": {
    "Voice": "8005@zhen04.cc"
  }
}
```