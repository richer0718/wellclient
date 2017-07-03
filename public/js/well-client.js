(function(){
    // console logs polyfill for some browser does support console
    if(typeof console === 'undefined'){
        var f = function(){};
        console = {
            log: f,
            debug: f,
            error: f,
            info: f
        };
    }
})();

var wellClient = (function($) {
    jQuery.support.cors = true;

    var app = function() {};
    app.pt = app.prototype;
    app.pt.getVersion = function(){
        return Config.version;
    };

    var Config = {
        version: '2.6.22',

        SDK: 'mbsdk.wellcloud.cc',
        cstaPort: ':5088',
        eventPort: ':5088',
        TPI: 'mbsdk.wellcloud.cc:5088/login',
        protocol: 'https://',
        wsProtocol: 'wss://',
        autoAnswer: true, // whether auto answer, need well-client-ui support

        // innerDeviceReg: /8\d{3,5}@/, // reg for inner deviceId; the ^8
        innerDeviceReg: /^8\d{3,5}|902138784800|902138834600/, // reg for inner deviceId

        // default config
        isManCloseWs: false,
        debug: true,
        useWsLog: true,
        eventBasePath: '/mvc/stomp',
        cstaBasePath: '/api/csta',
        clickCallClass: 'well-canBeCalled',
        timeout: 1, //  1s later will be reconnect
        maxReconnectTimes: 5, // max reconnect times
        currentReconnectTimes: 0, // current reconnect times
        isLogined: false,
        heartbeatLength: 1*60*1000, // herart beat frequency
        heartbeatId: '',    // heartbeat Id
        enableAlert: false, // whether enabled alert error msg
        useEventLog: true // whether use event log
    };


    var CONF = {

        'CMB-PRO':{
            SDK: 'mbsdk.wellcloud.cc',
            cstaPort: ':5088',
            eventPort: ':5088',
            TPI: 'mbsdk.wellcloud.cc:5088/login',
            protocol: 'https://',
            wsProtocol: 'wss://',
            autoAnswer: true
        },
        'CMB-DEV':{
            SDK: 'uatsdk.wellcloud.cc',
            cstaPort: '',
            eventPort: '',
            TPI:'uattpi.wellcloud.cc/login',
            protocol: 'https://',
            wsProtocol: 'wss://',
            autoAnswer: true
        },
        'CMB-UAT':{
            SDK: 'uatsdk.wellcloud.cc',
            cstaPort: '',
            eventPort: '',
            TPI:'uattpi.wellcloud.cc/login',
            protocol: 'https://',
            wsProtocol: 'wss://',
            autoAnswer: true
        },
        'OUR-DEV':{
            SDK: '172.16.200.152',
            cstaPort: ':58080',
            eventPort: ':58080',
            TPI:'172.16.200.152:58080/login',
            protocol: 'https://',
            wsProtocol: 'wss://',
            autoAnswer: true
        },
        'AWS-PRO':{
            SDK: 'tpisdk.wellcloud.cc',
            cstaPort: '',
            eventPort: '',
            TPI:'tpi.wellcloud.cc/login',
            protocol: 'http://',
            wsProtocol: 'ws://',
            autoAnswer: false
        },
        'OUR-TEST':{
            SDK: 'testsdk.wellcloud.cc',
            cstaPort: ':58080',
            eventPort: ':58080',
            TPI:'testsdk.wellcloud.cc:58080/loginTrusted',
            protocol: 'https://',
            wsProtocol: 'wss://',
            autoAnswer: true
        }
    };

    var ErrorTip = {
        withoutCallId: 'callMemory has not this callId form event, maybe call event sent for many times.'
    };

    // call object
    var callMemory = {
        length: 0 // callId counter
    };

    function fire(pathParm, payload){
        var path = util.render(this.path, pathParm);
        return util.sendRequest(path, this.method, payload);
    }

    // api path and status
    var apis = {
        setAgentState: {
            desc: 'setAgentState login and logout',
            path: '/agent/state',
            method: 'post',
            status: {
                204: 'login success',
                401: 'username or password error',
                426: 'get AccessToken failed',
                451: 'device unregistered',
                453: 'illegal deviceId',
                454: 'agent already logined other place',
                455: 'agent already logined others device',
                456: 'illegal device state',
                457: 'unauthorized device',
                459: 'the device you want to use is useing by other agent',
                460: 'can not set agent state when you are calling',
                461: 'online agent amount over max limit'
            },
            fire: fire
        },
        heartbeat:{
            desc:'agnent heart beat',
            path:'/agent/heartbeat/{{agentId}}',
            method:'post',
            fire: fire
        },
        makeCall: {
            desc: 'call out',
            path: '/callControl/calls',
            method: 'post',
            fire: fire
        },
        answerCall:{
            desp:'answer call',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/answer',
            method:'post',
            fire: fire
        },
        dropConnection:{
            desp:'hang up the call',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}',
            method:'delete',
            fire: fire
        },
        holdCall:{
            desp:'hold call',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/hold',
            method:'post',
            fire: fire
        },
        retrieveCall:{
            desp:'retrieve a call',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/retrieve',
            method:'post',
            fire: fire
        },
        singleStepTransfer:{
            desp:'single step transfer',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/singleStepTransfer',
            method:'post',
            fire: fire
        },
        singleStepConference:{
            desp:'single step conference',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/singleStepConference',
            method:'post',
            fire: fire
        },
        consult:{
            desp:'ask someome, hold current line',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/consult',
            method:'post',
            fire: fire
        },
        conference:{
            desp:'talk to everybody',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/conference',
            method:'post',
            fire: fire
        },
        cancelConsult:{
            desp:'cancel ask some',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/cancelConsult',
            method:'post',
            fire: fire
        },
        transferCall:{
            desp:'ask someone, then transfer',
            path:'/callControl/calls/{{callId}}/connections/{{connectionId}}/transfer',
            method:'post',
            fire: fire
        },
        setCallData:{
            desp:'set some data with callId',
            path:'/callControl/calls/{{callId}}/user-data',
            method:'post',
            fire: fire
        },
        getCallData:{
            desp:'get all data of callId',
            path:'/callControl/calls/{{callId}}/user-data/{{key}}',
            method:'get',
            fire: fire
        },
        spy: {
            desp: 'listen the agent talk',
            path: '/callControl/calls/{{callId}}/spy?deviceId={{deviceId}}',
            method: 'post',
            fire: fire
        },
        releaseAllocatedAgent: {
            desp: 'release allocated agent',
            path: '/api/csta/outbound/release/{{agentId}}',
            method: 'post',
            fire: fire
        },
    };

    // default info
    var user = {
        number: '',
        password: 'Aa123456',
        domain: 'cmb.cc',
        ext: '',
        loginMode: 'force',
        agentMode: 'NotReady'
    };

    var env = {
        user: {},
        sessionId: '',
        isAgentAllocated: false
    };

    var cache = {};

    // websocket
    var ws = {};

    var clock = {
        id: '',
        startTimeStramp: '',
        startClock: function(){
            var self = this;
            this.startTimeStramp = new Date().getTime();

            self.id = setInterval(function(){
                self.updateClock();
            }, 1000);
        },
        resetClock: function(){
            clock.startTimeStramp = new Date().getTime();
        },
        dealDruation: function(){
            var length = new Date().getTime() - this.startTimeStramp;
            length = Math.floor(length/1000);
            return length;
        },
        updateClock: function(){
            var clockTime = this.formatTime(this.dealDruation());
            $('#well-time-clock').text(clockTime);
        },
        formatTime: function(second){
            var secondType = typeof second;

            if(secondType === 'number' || secondType === 'string'){
                second = parseInt(second);

                var hours = Math.floor(second/3600);
                second = second - hours*3600;
                var mimute = Math.floor(second/60);
                second = second - mimute*60;

                return hours+':'+ ('0'+mimute).slice(-2)+':'+('0'+second).slice(-2);
            }
            else{
                return '0:00:00';
            }
        },
        restartClock: function(){
            this.closeClock();
            this.startClock();
        },
        closeClock: function(){
            clearInterval(this.id);
            $('#well-time-clock').text('0:00:00');
        },
    };

    // inner tool functions
    var util = {
        getCallId: function(){
            if(callMemory.length !== 1){
                return '';
            }

            for(var key in callMemory){
                if(callMemory.hasOwnProperty(key)){
                    if(typeof callMemory[key].deviceCount !== 'undefined'){
                        return key;
                    }
                }
            }
        },

        logCallMemory: function(){
            try{
                util.log('>>> CALLMEMORY\n\r'+JSON.stringify(callMemory));

                util.log('>>> ENV\n\r'+JSON.stringify(env));

                var nowStatus = Config.isLogined ? 'already login': 'already logout';

                util.log('>>> STATUS: '+ nowStatus);
            }
            catch(e){
                util.error(e)
            }
        },
        isOutCall: function(d1, d2){
            return this.isOutDeviceId(d1) || this.isOutDeviceId(d2);
        },

        isOutDeviceId: function(deviceId){
            deviceId = deviceId || '';
            deviceId = deviceId.split('@')[0];

            return !Config.innerDeviceReg.test(deviceId);
        },

        render: function(tpl, data){
            var re = /{{([^}]+)?}}/;
            var match = '';

            while(match = re.exec(tpl)){
                tpl = tpl.replace(match[0],data[match[1]]);
            }

            return tpl;
        },
        // clear cache
        clearCache:function(){
            if(!Config.isLogined){
                return;
            }

            env = {
                user: {},
                sessionId: '',
                isAgentAllocated: false
            };

            callMemory = {
                length: 0 // callId counter
            };

            window.onunload = null;
            Config.isLogined = false;

            util.closeWebSocket();

            // clear heartbeat
            clearInterval(Config.heartbeatId);
        },

        // log
        log: function(msg) {
            if (Config.debug && window.console) {
                console.info('>>>'+new Date());
                console.log(msg);
            }

            app.pt.outputLog({
                type: 'log',
                content: typeof msg === 'object' ? JSON.stringify(msg):msg
            });
        },

        error: function(msg) {
            if (Config.debug && window.console) {
                try{
                    throw new Error(msg);
                }catch(e){
                    console.error(e);
                }
            }

            app.pt.outputLog({
                type: 'error',
                content: typeof msg === 'object' ? JSON.stringify(msg):msg
            });

        },
        alert: function(msg) {
            if (Config.debug && window.console) {
                // console.info('>>>'+new Date());
                console.error(msg);
            }

            app.pt.outputLog({
                type: 'alert',
                content: typeof msg === 'object' ? JSON.stringify(msg):msg
            });
        },

        // typeof: function(opt) {
        //     return typeof opt;
        // },

        getErrorMsg: function(name, statusCode) {
            return apis[name].status[statusCode] || '';
        },

        isPhoneNumber: function(number) {
            return typeof number === 'string' && number !== '';
        },

        sendRequest: function(path, method, payload) {
            var dfd = $.Deferred();
            var url = Config.protocol+ Config.SDK + Config.cstaPort + Config.cstaBasePath + path;

            $.ajax({
                url: url,
                type: method || "get",
                headers: {
                    sessionId: env.sessionId || ''
                },
                data: JSON.stringify(payload),
                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                success: function(data) {
                    var okMsg = {
                        url: url,
                        method: method
                    };
                    util.debugout.log(okMsg);

                    dfd.resolve(data);
                },
                error: function(data) {
                    var errorMsg = {
                        url: url,
                        method: method,
                        payload: payload,
                        res: data
                    };
                    util.debugout.log(errorMsg);

                    dfd.reject(data);
                }
            });

            return dfd.promise();
        },

        ajax: function(url, method, payload, contentType){
            return $.ajax({
                url: url,
                method: method,
                data: payload,
                contentType: contentType,
                headers:{
                    sessionId: env.sessionId || ''
                }
            });
        },

        sendRequestSync: function(path, method, payload) {
            var dfd = $.Deferred();
            var url = Config.protocol+ Config.SDK + Config.cstaPort + Config.cstaBasePath + path;

            $.ajax({
                url: url,
                type: method || "get",
                headers: {
                    sessionId: env.sessionId || ''
                },
                data: JSON.stringify(payload),
                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                success: function(data) {
                    dfd.resolve(data);
                },
                error: function(data) {
                    dfd.reject(data);
                }
            });

            return dfd.promise();
        },



        // TPI login
        TPILogin:function(username, password, namespace){
            var dfd = $.Deferred();
            var url = Config.protocol + Config.TPI;
            var Data = 'username='+username+'&password='+password+'&namespace='+namespace;

            $.ajax({
                url: url,
                type: 'post',
                data: Data,
                dataType: "json",
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                success: function(data) {
                    var okMsg = {
                        url: url,
                        method: 'post',
                    };
                    util.debugout.log(okMsg);
                    dfd.resolve(data);
                },
                error: function(data) {
                    // util.log(data);
                    var errorMsg = {
                        url: url,
                        method: 'post',
                        payload: Data,
                        res: data
                    };
                    util.debugout.log(errorMsg);

                    util.log(data.responseText);
                    dfd.reject(data);
                }
            });

            return dfd.promise();
        },

        setAgentState: function(payload) {
            var dfd = $.Deferred();

            var method = apis.setAgentState.method,
                path = apis.setAgentState.path;

            util.sendRequest(path, method, payload)
                .done(function(res) {
                    dfd.resolve(res);
                })
                .fail(function(res) {
                    var statusCode = res.status;
                    util.error(apis.setAgentState.status[statusCode]);
                    dfd.reject(res);
                });

            return dfd.promise();
        },

        setAgentStateSync: function(payload) {
            var dfd = $.Deferred();

            var method = apis.setAgentState.method,
                path = apis.setAgentState.path;

            util.sendRequestSync(path, method, payload)
                .done(function(res) {
                    dfd.resolve(res);
                })
                .fail(function(res) {
                    dfd.reject(res);
                });

            return dfd.promise();
        },

        login: function(mode) {
            var $dfd = $.Deferred();

            var req = {
                loginId: env.loginId,
                device: env.deviceId,
                password: env.user.password,
                agentMode: env.user.agentMode,
                func: 'Login'
            };

            util.setAgentState(req)
            .done(function(res) {

                util.initSoftPhone();

                $dfd.resolve(res);
            })
            .fail(function(res) {
                mode = mode || 'ask';

                // for device already logined
                if (res.status == '454') {

                    // stop next
                    if(mode === 'stop'){
                        util.closeWebSocket();
                        $dfd.reject(res);
                    }

                    // ask
                    else if(mode === 'ask'){
                        var ask = confirm('分机已经在别的地方登录，或者上次分机忘记登出，是否强制登录');
                        if(ask){
                            // cache.logined = true;

                            app.pt.logout(false)
                            .done(function(res) {
                                util.login()
                                .done(function(res){
                                    $dfd.resolve();
                                });
                            });
                        }
                        else{
                            util.closeWebSocket();
                            $dfd.reject(res);
                        }

                    }

                    // force
                    else if(mode === 'force') {
                        // cache.logined = true;

                        app.pt.logout(false)
                        .done(function(res) {
                            util.login()
                            .done(function(res){
                                $dfd.resolve();
                            });
                        });
                    }
                }

                // for agent already logined
                else if(res.status == '455'){
                    var agentMode =  JSON.parse(res.responseText).agentMode;
                    if(agentMode === 'Allocated'){

                    }
                    util.closeWebSocket();
                    $dfd.reject(res);
                }
                else {
                    var errorMsg = util.getErrorMsg('setAgentState', res.status);
                    util.log(errorMsg);
                    util.closeWebSocket();
                    $dfd.reject(res);
                }
            });

            return $dfd.promise();
        },

        // start init websocket
        initWebSocket: function(callback) {
            callback = callback || function(){};

            if(ws && ws.connected){
                return;
            }

            Config.isManCloseWs = false;

            var url = Config.wsProtocol + Config.SDK + Config.eventPort + Config.eventBasePath + "/websocket";

            if(typeof WebSocket != 'function'){
                alert('您的浏览器版本太太太老了，请升级你的浏览器到IE11，或使用任何支持原生WebSocket的浏览器');
                return;
            }

            try{
                var socket = new WebSocket(url);
            }
            catch(e){
                console.log(e);
                return;
            }


            var wsHeartbeatId = '';

            ws = Stomp.over(socket);
            // ws.heartbeat.outgoing = 20000;
            // ws.heartbeat.incoming = 0;

            if(!Config.useWsLog){
                ws.debug = null;
            }

            wsHeartbeatId = setInterval(function(){
                if(ws && ws.connected){
                    ws.ws.send('h');
                }
                else{
                    clearInterval(wsHeartbeatId);
                }
            },25000);

            ws.connect({}, function(frame) {

                Config.currentReconnectTimes = 0;

                var dest = '/topic/csta/agent/' + env.loginId;
                var lastEvent = '';

                ws.subscribe(dest, function(event) {
                    if( lastEvent === event.body ){
                        util.log('Error: event repeat sent !');
                        return;
                    }
                    else{
                        lastEvent = event.body;
                    }

                    try{
                        var eventInfo = JSON.parse(event.body);
                    }
                    catch(e){
                        console.log(e);
                        return;
                    }

                    if(Config.useEventLog){
                        util.debugout.log(event.body);
                    }

                    eventHandler.deliverEvent(eventInfo);
                });
                callback();

            }, function(frame) {
                // websocket upexpected disconnected
                // maybe network disconnection, or browser in offline
                // this condition will emit wsDisconnected event
                if(Config.isManCloseWs){return;}

                util.log(frame);
                util.error(new Date() + 'websocket disconnect');
                clearInterval(wsHeartbeatId);

                if(Config.currentReconnectTimes < Config.maxReconnectTimes){
                    Config.currentReconnectTimes++;
                    util.reconnectWs();
                }
                else{
                    var errorMsg = {
                        eventName: 'wsDisconnected',
                        msg: 'websocket disconnect'
                    };
                    wellClient.ui.main({
                        eventName:'wsDisconnected'
                    });

                    wellClient.triggerInnerOn(errorMsg);
                }
            });
        },

        reconnectWs: function(){
            setTimeout(function(){
                util.log('>>> try to reconnect');
                util.initWebSocket();

            }, Config.timeout * 1000);
        },

        // close websocket
        closeWebSocket: function(){
            if(!$.isFunction(ws.disconnect)){
                return;
            }

            Config.isManCloseWs = true;

            ws.disconnect(function(res){
                util.log(res);
            });
        },

        /**
         * [clickCallListening]
         * @Author   Wdd
         * @DateTime 2016-12-13T09:41:37+0800
         * @param    {[string]} className [点击拨号的类名]
         */
        clickCallListening: function(className){
            $(document).on('click', '.'+className, function(e){
                e.stopPropagation();

                var phoneNumber = $(e.currentTarget).text().replace(/\D/g, '');
                app.pt.makeCall(phoneNumber);
            });
        },


        initSoftPhone: function(){

            util.clickCallListening(Config.clickCallClass);

            // when close or refresh the browser without logout, wellClient
            // will send a logout sync request.
            window.onunload = function(){
                util.closeWebSocket();

                var req = {
                    func: 'Logout',
                    device: env.deviceId,
                    namespace: env.user.domain
                };

                util.setAgentStateSync(req);
            };
        }
    };


    var eventHandler = {
        deliverEvent: function(eventInfo) {
            env.isAgentAllocated = eventInfo.eventName === 'agentAllocated' ? true : false;

            if(eventInfo.eventName === 'agentReady' || eventInfo.eventName === 'agentAllocated'){
                clock.restartClock();
            }
            else{
                clock.closeClock();
            }

            if($.isFunction(innerEventLogic[eventInfo.eventName])){
                innerEventLogic[eventInfo.eventName](eventInfo);
            }

            // others can define himself all events hander
            if($.isFunction(wellClient.exports)){
                wellClient.exports(eventInfo);
            }

            // you can just register one event too
            var registerOne = eventHandler[eventInfo.eventName];
            if($.isFunction(registerOne)){
                registerOne(eventInfo);
            }

            // after handle the event, log the CallMemory
            if(eventInfo.eventName !== 'ChannelStateChangedEvent'){
                // util.log(eventInfo);
                util.logCallMemory();
            }
        }
    };

     // just deal with one event handler
    var innerHandler = {
        deliverEvent: function(eventInfo) {

            var tempHandler = innerHandler[eventInfo.eventName];

            if($.isFunction(tempHandler)){
                tempHandler(eventInfo);
            }
        }
    };
//******************************************************************************
//
//                                   wdd-event
//
//******************************************************************************
    var innerEventLogic = {
        agentLoggedOn:function(data){
            Config.isLogined = true;

            callMemory = {
                length: 0 // callId counter
            };

            var uiInfo = {
                eventName:'agentLoggedOn',
                deviceId: data.deviceId
            };
            wellClient.ui.main(uiInfo);

            // first heartbeat
            app.pt.heartbeat();

            // other herarbeat will after two minutes late
            Config.heartbeatId = setInterval(function(){
                app.pt.heartbeat();
            }, Config.heartbeatLength);
        },

        agentWorkingAfterCall: function(data){

            wellClient.ui.main({
                eventName: 'agentWorkingAfterCall'
            });
        },

        agentLoggedOff:function(data){

            // if agent have no login successful, don't handle this event
            if(!Config.isLogined){
                return;
            }

            util.clearCache();
            util.debugout.clear();

            wellClient.ui.main({
                eventName: 'agentLoggedOff'
            });
        },

        agentReady:function(data){

            wellClient.ui.main({
                eventName: 'agentReady',
                reason: data.reason || ''
            });
        },

        agentNotReady: function(data){

            wellClient.ui.main({
                eventName: 'agentNotReady',
                reason: data.reason || ''
            });
        },
        delivered:function(data){
            // call out
            if(callMemory[data.callId]){

            }
            else{
                this.createCallModel(data);
            }

            var isCalling = data.callingDevice === env.deviceId;
            var otherDevice = isCalling ? data.calledDevice : data.callingDevice;

            wellClient.ui.main({
                eventName: 'delivered',
                deviceId: otherDevice,
                device: otherDevice.split('@')[0],
                callId: data.callId,
                isCalling: isCalling,
                autoAnswer: Config.autoAnswer
            });
        },

        createCallModel: function(data){
            callMemory.length++;
            callMemory[data.callId] = {};
            callMemory[data.callId].deviceCount = 2;
            callMemory[data.callId].createTimeId = new Date().valueOf();

            callMemory[data.callId][data.callingDevice] = {
                deviceId: data.callingDevice,
                connectionState: 'delivered',
                callId: data.callId,
                isCalling: true,
                callingDevice: data.callingDevice,
                calledDevice: data.calledDevice
            };

            callMemory[data.callId][data.calledDevice] = {
                deviceId: data.calledDevice,
                connectionState: 'delivered',
                callId: data.callId,
                isCalling: false,
                callingDevice: data.callingDevice,
                calledDevice: data.calledDevice
            };
        },

        ChannelStateChangedEvent:function(data){},

        established:function(data){
            if(!callMemory[data.callId]){
                console.error(ErrorTip.withoutCallId);
                return;
            }

            // change device connectionState
            callMemory[data.callId][data.callingDevice]
            .connectionState =
            callMemory[data.callId][data.calledDevice]
            .connectionState = 'connected';

            var deviceId = data.callingDevice === env.deviceId?
            data.calledDevice : data.callingDevice;

            // 呼出ui
            wellClient.ui.main({
                eventName:'established',
                deviceId:deviceId,
                device:deviceId.split('@')[0],
                callId:data.callId
            });
        },

        // 挂断
        connectionCleared:function(data){
            if(!callMemory[data.callId]){
                console.error(ErrorTip.withoutCallId);
                return;
            }

            var isEstatblished = callMemory[data.callId][data.releasingDevice].connectionState === 'connected' ? true: false;
            var createTimeId = callMemory[data.callId].createTimeId;
            var partyDevice = '';
            var isCaller = '';
            var isOutCall = false;
            // var isFromOut

            if(callMemory[data.callId].deviceCount === 2){
                var self = callMemory[data.callId][env.deviceId];
                partyDevice = self.isCalling ? self.calledDevice : self.callingDevice;
                isCaller = self.isCalling;

                var addDevice = callMemory[data.callId][env.deviceId].addDevice;

                if(addDevice && callMemory[data.callId][addDevice]){
                    isOutCall = true;
                }
                else{
                    isOutCall = util.isOutCall(self.calledDevice || '', self.callingDevice || '');
                }
            }
            else if(callMemory[data.callId].deviceCount === 3){
                if(data.releasingDevice === env.deviceId){
                    isOutCall = true;
                }
                else if(util.isOutDeviceId(data.releasingDevice)){
                    isOutCall = true;
                }
                else{
                    isOutCall = false;

                }
            }

            var innerEvent = {
                isEstatblished: isEstatblished,
                createTimeId: createTimeId,
                data: data,
                eventName: 'connectionCleared',
                partyDevice: partyDevice,
                isCaller: isCaller,
                isOutCall: isOutCall
            };

            if(data.releasingDevice === env.deviceId){
                var call = callMemory[data.callId][env.deviceId];
                var deviceId = call.isCalling?call.calledDevice:call.callingDevice;
                var isClearAll = false;

                if(!callMemory[data.callId][deviceId] && call.addDevice){
                    deviceId = call.addDevice;
                }

                // delete a callId branch
                delete callMemory[data.callId];
                callMemory.length--;

                if(callMemory.length === 0){
                    isClearAll = true;
                }

                wellClient.ui.main({
                    eventName: 'connectionCleared',
                    deviceId: deviceId,
                    isClearAll: isClearAll
                });
            }
            else{
                // deviceId delete a device of a callId branch
                if(callMemory[data.callId][data.releasingDevice]){
                    delete callMemory[data.callId][data.releasingDevice];
                    callMemory[data.callId].deviceCount--;

                    wellClient.ui.main({
                        eventName: 'connectionCleared',
                        deviceId: data.releasingDevice
                    });
                }
            }

            innerHandler.deliverEvent(innerEvent);
        },

        held:function(data){
            if(!callMemory[data.callId]){
                console.error(ErrorTip.withoutCallId);
                return;
            }

            var call = callMemory[data.callId][env.deviceId];
            var deviceId = call.isCalling?call.calledDevice:call.callingDevice;

            call.connectionState = 'held';

            wellClient.ui.main({
                eventName:'held',
                device:deviceId.split('@')[0],
                deviceId: deviceId
            });
        },//

        retrieved:function(data){
            if(!callMemory[data.callId]){
                console.error(ErrorTip.withoutCallId);
                return;
            }

            var call = callMemory[data.callId][env.deviceId];
            var deviceId = call.isCalling?call.calledDevice:call.callingDevice;

            call.connectionState = 'connected';

            wellClient.ui.main({
                eventName:'retrieved',
                device:deviceId.split('@')[0],
                deviceId: deviceId
            });
        },

        conferenced:function(data){
            // 被保持方
            if(!callMemory[data.callId] && callMemory[data.primaryOldCall]){
                var call = callMemory[data.primaryOldCall];
                var callingDevice = call[env.deviceId].callingDevice;
                var calledDevice = call[env.deviceId].calledDevice;

                callMemory[data.callId] = {
                    deviceCount: 2
                };

                var newCall = callMemory[data.callId];
                newCall.isConferenced = true;
                newCall[callingDevice] = {
                    callId: data.callId,
                    calledDevice: calledDevice,
                    callingDevice: callingDevice,
                    connectionState: 'connected',
                    device: callingDevice,
                    isCalling: true
                };
                newCall[calledDevice] = {
                    callId: data.callId,
                    calledDevice: calledDevice,
                    callingDevice: callingDevice,
                    connectionState: 'connected',
                    device: calledDevice,
                    isCalling: false
                };

                delete callMemory[data.primaryOldCall];
            }

            // 发起咨询方
            if(callMemory[data.callId] && callMemory[data.primaryOldCall]){
                var oldCall = callMemory[data.primaryOldCall];
                var newCall = callMemory[data.callId];

                var addCall = oldCall[env.deviceId].isCalling ? oldCall[env.deviceId].calledDevice:
                              oldCall[env.deviceId].callingDevice;

                newCall[addCall] = {
                    callId: data.callId,
                    calledDevice: oldCall[addCall].calledDevice,
                    callingDevice: oldCall[addCall].callingDevice,
                    connectionState: 'connected',
                    device: addCall,
                    isCalling: oldCall.isCalling
                };

                if(util.isOutDeviceId(addCall)){
                    callMemory[data.callId][env.deviceId].addDevice = addCall;
                }


                delete callMemory[data.primaryOldCall];
                callMemory.length--;
                newCall.deviceCount++;
            }

            // 该callId已经进入会议之中
            callMemory[data.callId].isConferenced = true;

            // 单步会议
            if(callMemory.length === 1){

            }

            wellClient.ui.main({
                eventName: 'conferenced',
                callId: data.callId
            });
        },

        agentAllocated: function(data){
            wellClient.ui.main({
                eventName:'agentAllocated'
            });
        }
    };
//******************************************************************************
//
//                                   外部公开接口
//
//******************************************************************************
    // 外部事件处理
    app.pt.on = function(name, fn) {
        eventHandler[name] = fn;
    };

    //
    app.pt.triggerInnerOn = function(event){
        innerHandler.deliverEvent(event);
    },

    // 经过处理后的事件
    app.pt.innerOn = function(name, fn){
        innerHandler[name] = fn;
    };

    // 获取呼叫内存
    app.pt.getCallMemory = function(){
        return callMemory;
    };

    // 触发事件
    app.pt.trigger = function(fn, data) {
        //只有在debug模式下才开启
        util[fn](data);
    };

    // 日志
    app.pt.log = function(msg) {
        util.log(msg);
    };

    // 报错
    app.pt.error = function(msg) {
        util.error(msg);
    };

    // 设置softphone的debug
    app.pt.setDebug = function(switcher) {
        Config.debug = switcher || true;
    };

    // 配置
    app.pt.setConfig = function(conf){

        Config.debug = conf.debug === false? false : Config.debug;
        Config.SDK = conf.SDK || Config.SDK;

        Config.cstaPort = typeof(conf.cstaPort) === 'undefined' ? Config.cstaPort : conf.cstaPort;
        Config.eventPort = typeof(conf.eventPort) === 'undefined' ? Config.eventPort : conf.eventPort;

        Config.eventBasePath = conf.eventBasePath || Config.eventBasePath;
        Config.TPI = conf.TPI || Config.TPI;
        Config.cstaBasePath = conf.cstaBasePath || Config.cstaBasePath;
        Config.useWsLog = conf.useWsLog === false? false: Config.useWsLog;
        Config.clickCallClass = conf.clickCallClass || Config.clickCallClass;
        Config.autoAnswer = conf.autoAnswer === false ? false : Config.autoAnswer;

        Config.hideButton = conf.hideButton || [];

        if(Config.hideButton.length > 0){
            var btns = Config.hideButton.map(function(btn){
                return '#'+btn;
            });

            btns = btns.join();
            $(btns).addClass('well-dn');
        }
    };

    app.pt.useConfig = function(selfEnv){
        if(typeof selfEnv != 'string'){return;}
        if(!CONF[selfEnv]){return;}

        Config.SDK = CONF[selfEnv].SDK;
        Config.cstaPort = CONF[selfEnv].cstaPort;
        Config.eventPort = CONF[selfEnv].eventPort;
        Config.TPI = CONF[selfEnv].TPI;
        Config.protocol = CONF[selfEnv].protocol;
        Config.wsProtocol = CONF[selfEnv].wsProtocol;
        Config.autoAnswer = CONF[selfEnv].autoAnswer;

        if(selfEnv === 'CMB-DEV'){
            user.domain = 'cmbyc.cc';
        }
        else if(selfEnv === 'CMB-PRO'){
            user.domain = 'cmb.cc';
        }
        else if(selfEnv === 'CMB-UAT'){
            user.domain = 'cmb.uat';
        }
    };

    // login
    app.pt.login = function(number, password, domain, ext, loginMode) {
        var $dfd = $.Deferred();

        util.logCallMemory();

        env.user.number = number || user.number;
        env.user.password = password || user.password;
        env.user.domain = domain || user.domain;
        env.user.ext = ext || user.ext;
        env.user.agentMode = user.agentMode;
        loingMode = loginMode || user.loginMode;

        env.loginId = env.user.number + '@' + env.user.domain;
        env.deviceId = env.user.ext + '@' + env.user.domain;

        util.TPILogin(env.user.number, env.user.password, env.user.domain)
        .done(function(res){
            env.sessionId = res.sessionId;
            util.initWebSocket();

            util.login(loginMode)
            .done(function(res){
                $dfd.resolve(res);
            })
            .fail(function(res){
                $dfd.reject(res);
            });

        })
        .fail(function(err){
            util.error('登录失败，请检查用户名、密码、域名是否正确');
            $dfd.reject(err);
        });

        return $dfd.promise();
    };

    // new login
    // user.jobNumber
    // user.password
    // user.domain
    // user.ext
    // user.loginMode
    // user.agentMode
    app.pt.agentLogin = function(User) {
        var $dfd = $.Deferred();

        util.logCallMemory();

        env.user.number = User.jobNumber || user.number;
        env.user.password = User.password || user.password;
        env.user.domain = User.domain || user.domain;
        env.user.ext = User.ext || user.ext;
        env.user.loginMode = User.loginMode || user.loginMode;
        env.user.agentMode = User.agentMode || user.agentMode;

        env.loginId = env.user.number + '@' + env.user.domain;
        env.deviceId = env.user.ext + '@' + env.user.domain;

        util.TPILogin(env.user.number, env.user.password, env.user.domain)
        .done(function(res){
            env.sessionId = res.sessionId;

            app.pt.heartbeat()
            .done(function(){
                util.initWebSocket(function(){

                    util.login(env.user.loginMode)
                    .done(function(res){
                        $dfd.resolve(res);
                    })
                    .fail(function(res){
                        $dfd.reject(res);
                    });

                });

            });

        })
        .fail(function(err){
            util.error(err);
            $dfd.reject(err);
        });

        return $dfd.promise();
    };

    // logout
    app.pt.logout = function() {

        var dfd = $.Deferred();

        util.logCallMemory();

        if(env.isAgentAllocated || callMemory.length != 0){
            console.log('当前正在通话中，或者预占中，无法退出');

            dfd.reject({
                reason: 'you can not logout when you are in agentAllocated state',
                responseText: 'negative'
            });
        }

        var req = {
            func: 'Logout',
            device: env.deviceId,
            namespace: env.user.domain,
            agentId: env.user.number + '@' + env.user.domain
        };

        util.setAgentState(req)
            .done(function(res) {
                dfd.resolve(res);
            })
            .fail(function(res) {
                dfd.reject(res);
            });

        return dfd.promise();
    };

    app.pt.setAgentMode = function(mode, reason) {
        var dfd = $.Deferred();

        util.logCallMemory();

        if (mode === 'Ready' || mode === 'NotReady') {
            var req = {
                func: 'SetState',
                device: env.deviceId,
                agentMode: mode,
                namespace: env.user.domain,
                reason: reason || '',
                agentId: env.user.number + '@' + env.user.domain
            };

            util.setAgentState(req)
                .done(function(res) {

                    app.pt.sendPendingMode(res);

                    dfd.resolve(res);
                })
                .fail(function(res) {
                    dfd.reject(res);
                });
        } else {
            util.error('参数必须是Ready或者NotReady');
        }

        return dfd.promise();
    };

    app.pt.sendPendingMode = function(res){
        if(typeof res !== 'object'){
            return;
        }
        if(!res.pendingMode){
            return;
        }

        console.log('come in pending mode');
        wellClient.ui.main({
            eventName: 'setPendingMode'
        });
    };

    // 给第三方输入日志
    app.pt.outputLog = function(msg){
        if($.isFunction(wellClient.onLog)){
            wellClient.onLog(msg);
        }
    };
//******************************************************************************
//
//                                   wdd-csta
//
//******************************************************************************
    /**
     * [forceDrop 强拆: 强制通话中的设备挂断电话]
     * @Author   Wdd
     * @DateTime 2017-03-02T12:00:02+0800
     * @param    {[string]} deviceId [设备id，例如8001@test.com]
     * @param    {[stting]} callId [呼叫id]
     * @return   {[promise]} [description]
     */
    app.pt.forceDrop = function(deviceId, callId){
        if(typeof deviceId !== 'string'){return;}
        if(typeof callId !== 'string'){return;}

        var pathParm = {
            callId: callId,
            connectionId: deviceId+'|'+callId
        };

        return apis.dropConnection.fire(pathParm);
    };

    /**
     * [forceJoin 强插]
     * @Author   Wdd
     * @DateTime 2017-03-01T15:14:53+0800
     * @return   {[type]} [description]
     */
    app.pt.forceJoin = function(deviceId, callId, phoneNumber){
        if(typeof deviceId !== 'string'){return;}
        if(typeof callId !== 'string'){return;}
        if(typeof phoneNumber !== 'string'){return;}

        var pathParm = {
            callId: callId,
            connectionId: deviceId+'|'+callId
        };

        var payload = {
            conferenceParticipant: phoneNumber,
            participationType: "Active"
        };

        return apis.singleStepConference.fire(pathParm, payload);
    };

    /**
     * [forceTake 接管]
     * @Author   Wdd
     * @DateTime 2017-03-01T15:15:36+0800
     * @return   {[type]} [description]
     */
    app.pt.forceTake = function(deviceId, callId, phoneNumber){
        if(typeof deviceId !== 'string'){return;}
        if(typeof callId !== 'string'){return;}
        if(typeof phoneNumber !== 'string'){return;}

        var pathParm = {
            callId: callId,
            connectionId: deviceId+'|'+callId
        };

        var payload = {
            transferTo: phoneNumber
        };

        return apis.singleStepTransfer.fire(pathParm, payload);
    };

    /**
     * [forceListen 监听设备]
     * @Author   Wdd
     * @DateTime 2017-03-01T15:15:57+0800
     * @return   {[type]} [description]
     */
    app.pt.forceListen = function(callId, deviceId){
        if(typeof deviceId !== 'string'){return;}
        if(typeof callId !== 'string'){return;}

        var pathParm = {
            callId: callId,
            deviceId: deviceId
        };

        return apis.spy.fire(pathParm);
    };


    app.pt.forceReady = function(agentId, deviceId){
        if(typeof deviceId !== 'string'){return;}
        if(typeof agentId !== 'string'){return;}

        var pathParm = {};
        var payload = {
            func: 'SetState',
            agentMode: 'Ready',
            loginId: agentId,
            agentId: agentId,
            device: deviceId
        };

        return apis.setAgentState.fire(pathParm, payload);
    };

    app.pt.forceNotReady = function(agentId, deviceId){
        if(typeof deviceId !== 'string'){return;}
        if(typeof agentId !== 'string'){return;}

        var pathParm = {};
        var payload = {
        func: 'SetState',
           agentMode: 'NotReady',
           loginId: agentId,
           agentId: agentId,
           device: deviceId
        };

        return apis.setAgentState.fire(pathParm, payload);
    };

    app.pt.forceLogout = function(agentId, deviceId){

        if(typeof deviceId !== 'string'){return;}
        if(typeof agentId !== 'string'){return;}

        var pathParm = {};
        var payload = {
            namespace: agentId.split('@')[1],
            func: 'Logout',
            device: deviceId,
            agentId: agentId,
            loginId: agentId
        };

        return apis.setAgentState.fire(pathParm, payload);
    };


    /**
     * [releaseAgent 释放预占中的坐席]
     * @param    {[string]} callId [callId]
     */
    app.pt.releaseAllocatedAgent = function(agentId){

        return apis.releaseAllocatedAgent.fire({
            agentId: agentId
        });
    };

    /**
     * [getCallData 获取随路数据]
     * @param    {[string]} callId [callId]
     */
    app.pt.getCallData = function(callId){
        callId = callId || '';

        var pathParm = {
            callId: callId,
            key: ''
        };

        return apis.getCallData.fire(pathParm);
    };

    /**
     * [setCallData 设置随路数据]
     * @param    {[string]} callId [callId]
     * @param    {[array]} data [对象数组 [{key:'name', value:'wdd'},{key:'', value:''}]]
     */
    app.pt.setCallData = function(callId, data){
        callId = callId || '';
        data = data || {};

        var pathParm = {
            callId: callId
        };
        var payload = {
            entries:data
        };

        return apis.setCallData.fire(pathParm, payload);
    };

    // 心跳
    app.pt.heartbeat = function(){
        var pathParm = {
            agentId:env.loginId
        };

        return apis.heartbeat.fire(pathParm);
    };

    // 转移
    app.pt.transferCall = function(holdCallId, consultCallId){
        util.logCallMemory();
        holdCallId = holdCallId || '';
        consultCallId = consultCallId || '';

        var pathParm = {
            callId:holdCallId,
            connectionId:env.deviceId+'|'+holdCallId
        };

        var payload = {
            consultCallId:consultCallId
        };

        return apis.transferCall.fire(pathParm, payload);
    };

    // 取消咨询
    app.pt.cancelConsult = function(holdCallId, consultCallId){
        util.logCallMemory();
        holdCallId = holdCallId || '';
        consultCallId = consultCallId || '';

        var pathParm = {
            callId:holdCallId,
            connectionId:env.deviceId+'|'+holdCallId
        };

        var payload = {
            consultCallId:consultCallId
        };

        return apis.cancelConsult.fire(pathParm, payload);
    };

    // 会议
    app.pt.conference = function(holdCallId, consultCallId){
        util.logCallMemory();
        holdCallId = holdCallId || '';
        consultCallId = consultCallId || '';

        var pathParm = {
            callId:holdCallId,
            connectionId:env.deviceId+'|'+holdCallId
        };

        var payload = {
            consultCallId:consultCallId
        };

        return apis.conference.fire(pathParm, payload);
    };


    // 咨询
    app.pt.consult = function(callId, phoneNumber){
        util.logCallMemory();
        callId = callId || '';
        phoneNumber = phoneNumber || '';

        var pathParm = {
            callId:callId,
            connectionId:env.deviceId+'|'+callId
        };
        var payload = {
            consultationParticipant:phoneNumber
        };

        return apis.consult.fire(pathParm, payload);
    };

    // 单步会议
    app.pt.singleStepConference = function(callId, phoneNumber, type){
        util.logCallMemory();
        callId = callId || '';
        phoneNumber = phoneNumber || '';
        type = type || '';

        var pathParm = {
            callId:callId,
            connectionId:env.deviceId+'|'+callId
        };
        var payload = {
            conferenceParticipant:phoneNumber,
            participationType: type || 'Active'
        };

        return apis.singleStepConference.fire(pathParm, payload);
    };

    // 单步转移
    app.pt.singleStepTransfer = function(callId,phoneNumber){
        util.logCallMemory();
        callId = callId || '';
        phoneNumber = phoneNumber || '';

        var pathParm = {
            callId:callId,
            connectionId:env.deviceId+'|'+callId
        };

        var payload = {
            transferTo:phoneNumber
        };

        return apis.singleStepTransfer.fire(pathParm, payload);
    };

    // 取回电话
    app.pt.retrieveCall = function(callId){
        util.logCallMemory();
        callId = callId;

        var pathParm = {
            callId:callId,
            connectionId:env.deviceId+'|'+callId
        };

        return apis.retrieveCall.fire(pathParm);
    };

    // 保持电话
    app.pt.holdCall = function(callId){
        util.logCallMemory();

        callId = callId || '';

        var pathParm = {
            callId:callId,
            connectionId:env.deviceId+'|'+callId
        };

        return apis.holdCall.fire(pathParm);
    };


    // 挂断电话
    app.pt.dropConnection = function(callId){

        util.logCallMemory();

        callId = callId || util.getCallId();
        var dfd = $.Deferred();

        var pathParm = {
            callId:callId,
            connectionId:env.deviceId+'|'+callId
        };

        return apis.dropConnection.fire(pathParm);
    };

    // 接通电话
    app.pt.answerCall = function(callId){
        util.logCallMemory();

        callId = callId || '';
        var pathParm = {
            callId: callId,
            connectionId:env.deviceId+'|'+callId
        };

        return apis.answerCall.fire(pathParm);
    };

    // 拨打电话，无论外部有没有验证，接口自己都必须做验证

    app.pt.makeCall = function(phoneNumber, options) {
        util.logCallMemory();

        options = options || {};
        var length = app.pt.getCallMemory().length;

        if(env.isMakingCall){
            util.error('短时间内，请勿多次拨号！');
        }
        else if(!Config.isLogined){
            alert('当前未登录，无法拨号!');
            util.error('当前未登录，无法拨号!');
        }
        else if (!util.isPhoneNumber(phoneNumber)) {
            util.error('输入号码不合法');
        }
        else if (phoneNumber === env.user.ext) {
            util.error('请勿输入自己的号码');
        }
        else if(length > 0){
            alert('当前已有一通通话，请挂断当前通话后再拨打');
            util.error('already had a line, please drop current line then make another call');
        }
        else if(env.isAgentAllocated){
            alert('当前处于预占状态，请勿拨号！');
            util.error('you can not logout when you are in agentAllocated state');
        }
        else {

            env.isMakingCall = true;
            (function(env){
                setTimeout(function(){
                    env.isMakingCall = false;
                }, 2000);
            })(env);

            var payload = {
                    from: env.deviceId,
                    to: (options.prefix || '') + phoneNumber
                };
            return apis.makeCall.fire({}, payload);
        }
    };

    // 获取组件并加以缓存
    app.pt.get = function(tag){
        return $(tag);
    };

    // 获取缓存
    app.pt.getCache = function(){
        return cache;
    };

    // 渲染模板
    app.pt.render = function(tpl,data){
        var re = /{{([^}]+)?}}/g;
        var match = '';

        while(match = re.exec(tpl)){
            tpl = tpl.replace(match[0],data[match[1]]);
        }

        return tpl;
    };

    app.pt.isPhoneNumber = function(phoneNumber){
        return util.isPhoneNumber(phoneNumber);
    };

    app.pt.isFunction = function(value){
        return Object.prototype.toString.call(value) === '[object Function]';
    };

    app.pt.isArray = function(value){
        return Object.prototype.toString.call(value) === '[object Array]';
    };

    app.pt.findItem = function(itemList, key, value){
        if(!app.pt.isArray(itemList)){
            return false;
        }

        if(typeof key !== 'string'){
            return false;
        }

        if(typeof value === 'undefined'){
            return false;
        }

        for(var i=0; i<itemList.length; i++){
            if(itemList[i][key] === value){
                return i;
            }
        }

        return -1;
    };

    app.pt.deliverEvent = function(eventInfo){
        eventHandler.deliverEvent(eventInfo);
    };

    app.pt.isLogined = function(){
        return Config.isLogined;
    };


    // event log------------------------------------------------------------------------------------
    util.debugout = new debugout();

    app.pt.uploadLog = function(){
        if(!Config.isLogined){return;}

        var log = util.debugout.output;
        var filename = app.pt.createLogName();
        // download log path /client-log/download?filename={{filename}}
        var url =  Config.protocol + Config.SDK + Config.cstaPort + '/client-log/upload?filename='+filename;

        if(log === ''){return;}
        util.ajax(url, 'post', log, 'text/xml');
    };

    app.pt.createLogName = function(){
        var number = env.user.number;
        var domain = env.user.domain;
        var timestamp = new Date();

        var month = ('0' + (timestamp.getMonth() +1)).slice(-2);
        var date = ('0'+timestamp.getDate()).slice(-2);
        var hrs = ('0' + timestamp.getHours()).slice(-2);
        // https://mbsdk.wellcloud.cc:5088/client-log/download?filename=
        // 域名只保留数字和字母w工号w月份天时
        var filename = domain+'w'+number+'w'+month+date+hrs+'txt';

        return filename.replace(/[^A-Za-z0-9]/g, '');
    };

    // save all the console.logs
    function debugout() {
        var self = this;
        // config
        self.realTimeLoggingOn = false; // log in real time (forwards to console.log)
        self.recordLogs = true; // set to false after you're done debugging to avoid the log eating up memory
        self.maxLines = 2500; // if autoTrim is true, this many most recent lines are saved
        self.lineMaxChars = 1500; // if one log is max than lineMaxChars, it will be cut
        self.logFilename = 'log4b.txt'; // filename of log downloaded with downloadLog()
        self.lineBreak = '\n\n';

        // log save
        self.output = '';

        this.getLog = function() {
            return self.recordLogs? self.output : 'log recording is off';
        };

        this.downloadLog = function() {
            var downloadFileName = self.formatTimestamp()+ '-' + self.logFilename;

            if(window.navigator.msSaveBlob){
                // for ie 10 and later
                try{
                    var blobObject = new Blob([self.output]);
                    window.navigator.msSaveBlob(blobObject, downloadFileName);
                }
                catch(e){
                    console.log(e);
                }
            }
            else{
                var file = "data:text/plain;charset=utf-8,";
                var logFile = self.output;
                var encoded = encodeURIComponent(logFile);
                file += encoded;
                var a = document.createElement('a');
                a.href = file;
                a.target   = '_blank';
                a.download = downloadFileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        };

        this.search = function(string){
            var lines = self.output.split(self.lineBreak);
            var rgx = new RegExp(string);
            var matched = [];

            for (var i = 0; i < lines.length; i++) {
                if (rgx.test(lines[i])) {
                    matched.push('['+i+']: '+lines[i]);
                }
            }
            var result = matched.join(self.lineBreak);
            return result ? result : 'Nothing found for "'+string+'".';
        };

        this.clear = function() {
            var clearTime = new Date();
            self.output = '';
            if (self.realTimeLoggingOn) {
                console.log('[log4b.js] clear()');
            }
        };

        this.log = function(obj) {
            if(!self.recordLogs){return;}
            (function(obj){
                setTimeout(function(){
                    self._log(obj);
                }, 0);
            })(obj);
        };

        this._log = function(obj) {
            if(typeof obj === 'object'){
                obj = JSON.stringify(obj);
            }
            if(typeof obj !== 'string'){
                return;
            }
            if (self.realTimeLoggingOn) {
                console.log(obj);
            }

            self.output += '['+self.formatTimestamp()+']: ';
            self.output += self.cutExceededChars(obj) + self.lineBreak;
            self.output = self.trimLog(self.output, self.maxLines);
        };

        this.cutExceededChars = function(obj){
            if(obj.length > self.lineMaxChars){
                return obj.substr(0, self.lineMaxChars);
            }
            else{
                return obj;
            }
        };

        this.trimLog = function(log, maxLines) {
            var lines = log.split(self.lineBreak);
            if (lines.length > maxLines) {
                lines = lines.slice(lines.length - maxLines);
            }
            return lines.join(self.lineBreak);
        };

        this.lines = function() {
            return self.output.split(self.lineBreak).length - 1;
        };

        this.formatTimestamp = function() {
            var timestamp = new Date();
            var year = timestamp.getFullYear();
            var month = ('0' + (timestamp.getMonth() +1)).slice(-2);
            var date = ('0'+timestamp.getDate()).slice(-2);
            var hrs = ('0' + timestamp.getHours()).slice(-2);
            var mins = ('0' + timestamp.getMinutes()).slice(-2);
            var secs = ('0' + timestamp.getSeconds()).slice(-2);
            var ms = timestamp.getMilliseconds();
            return year + '-' + month + '-' + date + ' ' + hrs + ':' + mins + ':'+secs+'.'+ms;
        };
    }


    app.pt.downloadLog = util.debugout.downloadLog;
    app.pt.getLog = util.debugout.getLog;
    app.pt.clearLog = util.debugout.clear;
    app.pt.seacchLog = util.debugout.search;

    app.pt.enableLog = function(){
        Config.useEventLog = true;
    };

    app.pt.disableLog = function(){
        Config.useEventLog = false;
    };


    // listen message------------------------------------------------------------------------------------
        window.addEventListener('message', function(event){
            var data = event.data;

            try{
                data = JSON.parse(data);
                handlePostMessage.deliverMessage(data);
            }
            catch(e){
                util.error(e);
                util.error('message must be a stringify object!!');
            }
        });

    // *** handler post message
        var handlePostMessage = {
            deliverMessage: function(message){
                var method = message.method;
                if($.isFunction(this[method]) && method !== 'deliverMessage'){
                    this[method](message);
                }
            },
            getCallMemory: function(message){
                util.logCallMemory();
            },
            makeCall: function(message){
                var phoneNumber = message.phoneNumber;
                wellClient.makeCall(phoneNumber);
            },
            logEnv: function(){
                console.log(env);
            },
            getLog: function(){
                console.log(wellClient.getLog());
            },
            downloadLog: function(){
                wellClient.downloadLog();
            }
        };



    return new app();
})(jQuery);
