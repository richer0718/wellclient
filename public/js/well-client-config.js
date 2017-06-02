var WellClientConfig = {
    debug: true,
    useWsLog: true,
    SDK: '163.53.88.183',
    cstaPort: '8088',
    eventPort: '8088',
    eventBasePath: '/mvc/stomp',
    cstaBasePath: '/api/csta',
    clickCallClass:'well-canBeCalled',
    timeout: 5, // 断线5秒后重连
    maxReconnectTimes: 5, // 最多重连次数
    currentReconnectTimes: 0, // 当前重连次数
    TPI:'163.53.88.183:5003/login',
    isLogined: false,
    heartbeatLength: 2*60*1000, // 心跳频率
    heartbeatId: '',    // 心跳Id
    enableAlert: false, // 是否启用alert弹出错误信息
    autoAnswer: true // 是否自动接听
};