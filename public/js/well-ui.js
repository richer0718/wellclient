//-----------------------------------------------------------------------------+
//+                                                                            +
//+                          wellClient-csta                                   +
//+                                                                            +
//-----------------------------------------------------------------------------+
$(document).on('click change','.well-option',function(event){
    var destId = $(event.currentTarget).attr('id');

    if(destId=='well-setMode' && event.type=='click'){
        return;
    }

    switch(destId){
        case 'well-setMode' :wellClient.csta.setAgentMode() ;break;
        case 'well-make'    :wellClient.csta.makeCall()     ;break;
        case 'well-answer'  :wellClient.csta.answerCall()   ;break;
        case 'well-hold'    :wellClient.csta.holdCall()     ;break;
        case 'well-retrieve':wellClient.csta.retrieveCall() ;break;
        case 'well-sTran'   :wellClient.csta.singleStepTransfer()   ;break;
        case 'well-tran'    :wellClient.csta.transfer()     ;break;
        case 'well-ask'     :wellClient.csta.consultationCall()     ;break;
        case 'well-cAsk'    :wellClient.csta.cancelConsult()        ;break;
        case 'well-sConf'   :wellClient.csta.singleStepConference() ;break;
        case 'well-conf'    :wellClient.csta.conference()   ;break;
        case 'well-dropCon' :wellClient.csta.dropConnection()       ;break;
        case 'well-logout'  :wellClient.csta.logout()               ;break;
        case 'well-login'   :wellClient.csta.login()                ;break;
        default:return;
    }
});

wellClient.csta = {

    // 取消咨询
    transfer:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '',
            consultCallId = '';

        if($callLines.length !== 2){
            return;
        }

        callId = $callLines.eq(0).data('callid');
        consultCallId = $callLines.eq(1).data('callid');

        wellClient.ui.disableBtns(['conf']);

        wellClient.transferCall(callId, consultCallId)
        .always(function(){
            wellClient.ui.enableBtns(['conf']);
        });
    },

    // 取消咨询
    cancelConsult:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '',
            consultCallId = '';

        if($callLines.length !== 2){
            return;
        }

        callId = $callLines.eq(0).data('callid');
        consultCallId = $callLines.eq(1).data('callid');

        wellClient.ui.disableBtns(['conf']);

        wellClient.cancelConsult(callId, consultCallId)
        .always(function(){
            wellClient.ui.enableBtns(['conf']);
        });
    },

    // 会议
    conference:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '',
            consultCallId = '';

        if($callLines.length !== 2){
            return;
        }

        callId = $callLines.eq(0).data('callid');
        consultCallId = $callLines.eq(1).data('callid');

        wellClient.ui.disableBtns(['conf']);

        wellClient.conference(callId, consultCallId)
        .always(function(){
            wellClient.ui.enableBtns(['conf']);
        });
    },

    // 咨询电话
    consultationCall:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '',
            $callNumber = $('#well-number');
            phoneNumber = $callNumber.val();

        if(!wellClient.isPhoneNumber(phoneNumber)){
            wellClinet.error('不是合法手机号');
            return;
        }

        if($callLines.length === 1){
            callId = $callLines.data('callid');
        }

        wellClient.ui.disableBtns(['ask']);

        wellClient.consult(callId,phoneNumber)
        .always(function(){
            wellClient.ui.enableBtns(['ask']);
        });
    },

    // 单步会议
    singleStepConference:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '',
            $callNumber = $('#well-number');
            phoneNumber = $callNumber.val();

        if(!wellClient.isPhoneNumber(phoneNumber)){
            wellClinet.error('不是合法手机号');
            return;
        }

        if($callLines.length === 1){
            callId = $callLines.data('callid');
        }

        wellClient.ui.disableBtns(['sConf']);

        wellClient.singleStepConference(callId,phoneNumber)
        .always(function(){
            wellClient.ui.enableBtns(['sConf']);
        });
    },

    // 单步转移
    singleStepTransfer:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '',
            $callNumber = $('#well-number');
            phoneNumber = $callNumber.val();

        if(!wellClient.isPhoneNumber(phoneNumber)){
            wellClinet.error('不是合法手机号');
            return;
        }

        if($callLines.length === 1){
            callId = $callLines.data('callid');
        }

        wellClient.ui.disableBtns(['sTran']);

        wellClient.singleStepTransfer(callId,phoneNumber)
        .always(function(){
            wellClient.ui.enableBtns(['sTran']);
        });
    },

    // 取回电话
    retrieveCall:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '';


        if($callLines.length === 1){
            callId = $callLines.data('callid');
        }

        wellClient.ui.disableBtns(['retrieve']);

        wellClient.retrieveCall(callId)
        .always(function(){
            wellClient.ui.enableBtns(['retrieve']);
        });
    },
    // 保持电话
    holdCall:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '';

        wellClient.ui.disableBtns(['hold']);

        if($callLines.length === 1){
            callId = $callLines.data('callid');
        }

        wellClient.holdCall(callId)
        .always(function(){
            wellClient.ui.enableBtns(['hold']);
        });
    },

    // 设置坐席状态
    setAgentMode:function(){
       var mode = wellClient.get('#well-setMode').val();
       wellClient.setAgentMode(mode)
       .fail(function(res){
           wellClient.error(res);
       }); 
    },

    // 拨号
    makeCall:function(){
        var $callNumber = $('#well-number');
        var phoneNumber = $callNumber.val();

        wellClient.ui.disableBtns(['make']);

        wellClient.makeCall(phoneNumber)
        .done(function(res){
        })
        .fail(function(res){
            wellClient.error(res);
        })
        .always(function(){
            wellClient.ui.enableBtns(['make']);
        });
    },

    // 登出
    logout:function(){
        wellClient.logout()
        .done(function(){
            wellClient.ui.resetUi();
        });
    },

    // 登录
    login:function(){
        wellClient.login();
    },

    // answer call
    answerCall:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '';

        wellClient.ui.disableBtns(['answer']);

        if($callLines.length === 1){
            callId = $callLines.data('callid');
        }

        wellClient.answerCall(callId)
        .always(function(){
            wellClient.ui.enableBtns(['answer']);
        });
    },

    // drop connection
    dropConnection:function(){
        var $callLines = wellClient.get('.well-callLine'),
            callId = '';

        wellClient.ui.disableBtns(['dropCon']);

        if($callLines.length === 1){
            callId = $callLines.data('callid');
        }
        else if($callLines.length === 2){
            callId = $callLines.eq(1).data('callid');
        }

        wellClient.dropConnection(callId)
        .always(function(){
            wellClient.ui.enableBtns(['dropCon']);
        });
    }
};

//-----------------------------------------------------------------------------+
//+                                                                            +
//+                          wellClient-ui-event                               +
//+                                                                            +
//-----------------------------------------------------------------------------+
wellClient.ui = {
    getBtns:function(btns){
        return wellClient.get('#well-'+btns.join(',#well-'));
    },

    disableBtns:function(btns){
        wellClient.ui.getBtns(btns).attr('disabled','disabled').removeClass('well-active');
    },

    enableBtns:function(btns){
        wellClient.ui.getBtns(btns).removeAttr('disabled').addClass('well-active');
    },

    // 事件驱动的ui改变，主要入口
    main:function(data){
        wellClient.ui[data.eventName](data);
    },

    resetUi:function(){
        wellClient.get('.well-control').attr('disabled','disabled').removeClass('well-active');
        wellClient.get('#well-login').removeClass('well-dn');
        wellClient.get('#well-logout').addClass('well-dn');
    },

    agentLoggedOn:function(data){
        // wellClient.get('#well-jobNumber').text('工号：'+data.body.jobNumber);
        // wellClient.get('#well-device').text('分机号：'+data.body.device);
        wellClient.get('#well-login').addClass('well-dn');
        wellClient.get('#well-logout').removeClass('well-dn');

        var btns = wellClient.ui.getBtns(['make','setMode']);

        wellClient.get(btns).removeAttr('disabled');
        wellClient.ui.enableBtns(['make','logout']);
    },

    agentLoggedOff:function(data){
        // wellClient.get('#well-jobNumber').text(' ');
        // wellClient.get('#well-device').text(' ');
        wellClient.get('#well-login').removeClass('well-dn');
        wellClient.get('#well-logout').addClass('well-dn');
    },

    agentReady:function(data){

    },

    originated:function(data){
        var template = '<div id="well-device-{{device}}" data-deviceid="{{deviceId}}" data-callid="{{callId}}" class="well-inline well-callLine">'+
            '<span class="well-showPhone">{{device}}</span>'+
            '<span class="well-showState">呼出</span>'+
        '</div>';

        wellClient.get('#well-phone').append(wellClient.render(template,data));

        wellClient.ui.getBtns(['drop']).removeAttr('disabled');
    },

    delivered:function(data){
        var $device = wellClient.get('#well-device-'+data.device);

        if($device.length === 0){
            var template = '<div id="well-device-{{device}}" data-deviceid="{{deviceId}}" data-callid="{{callId}}" class="well-inline well-callLine">'+
                '<span class="well-showPhone">{{device}}</span>'+
                '<span class="well-showState">呼入</span>'+
            '</div>';

            wellClient.get('#well-phone').append(wellClient.render(template,data));

            wellClient.ui.enableBtns(['answer','dropCon']);
        }
        else{
            $device.find('.well-showState').text('振铃');   
            wellClient.ui.enableBtns(['dropCon']);
        }

        wellClient.ui.disableBtns(['make']);
    },

    established:function(data){
        var $device = wellClient.get('#well-device-'+data.device);
        var $callLines = $('.well-callLine');

        $device.find('.well-showState').text('通话中');

        if($callLines.length === 1){
            
            // 禁用按钮：拨号，接听
            wellClient.ui.disableBtns(['make','answer']);

            // 启用按钮：保持，转接，挂断
            wellClient.ui.enableBtns(['hold','sTran','dropCon','ask','sConf']);
        }
        else if($callLines.length === 2){
            var state = $callLines.eq(0).find('.well-showState').text();

            if(state === '保持'){
                
                // 禁用按钮：拨号，接听
                wellClient.ui.disableBtns(['make','answer','hold','sTran','sConf','ask']);

                // 启用按钮：保持，转接，挂断
                wellClient.ui.enableBtns(['conf','dropCon','cAsk','tran']);
            }
        }

    },

    connectionCleared:function(data){
        var $device = wellClient.get('#well-device-'+data.device),
        $callLines = wellClient.get('.well-callLine');

        if($device.length === 0){
            return;
        }

        if(data.needClearAll){
            $callLines.remove();
            // 启用按钮：拨号，接听
            wellClient.ui.enableBtns(['make']);

            // 禁用按钮：保持，转接，挂断
            wellClient.ui.disableBtns(['conf','dropCon','answer','hold','sTran','sConf','ask']);
            return;
        }

        $device.remove();


        if($callLines.length === 1){
            // 当前只用一条线路，该设备使用所有的空间

            // 禁用按钮：接听，保持，转接，挂断
            wellClient.ui.disableBtns(['answer','hold','sTran','sConf','ask','conf','dropCon','cAsk','tran']);

            // 启用按钮：拨号
            wellClient.ui.enableBtns(['make']);
        }
        else if($callLines.length === 2){
            // 禁用按钮：接听，保持，转接，挂断
            wellClient.ui.disableBtns(['make','answer','conf','cAsk','tran']);

            // 启用按钮：拨号
            wellClient.ui.enableBtns(['hold','sTran','sConf','ask','dropCon']);

            // var $one = $('.well-callLine').eq(0);

            // if($one.data('state') === 'held'){
            //     var callId = $one.data('callid');
            //     wellClient.retrieveCall(callId);
            // }
        }
    },

    held:function(data){
        var $device = wellClient.get('#well-device-'+data.device),
        $callLines = wellClient.get('.well-callLine');

        $device.find('.well-showState').text('保持'); 
        $device.data('state', 'held');

        if($callLines.length === 1){
            // 当前只用一条线路，该设备使用所有的空间
            wellClient.get('#well-hold').addClass('well-dn');
            wellClient.get('#well-retrieve').removeClass('well-dn');
        }
    },

    retrieved:function(data){
        var $device = wellClient.get('#well-device-'+data.device),
        $callLines = wellClient.get('.well-callLine');

        $device.find('.well-showState').text('通话中'); 

        if($callLines.length === 1){
            // 当前只用一条线路，该设备使用所有的控件
            wellClient.get('#well-hold').removeClass('well-dn');
            wellClient.get('#well-retrieve').addClass('well-dn');

            // 禁用按钮：接听，保持，转接，挂断
            wellClient.ui.disableBtns(['make','answer','conf']);

            // 启用按钮：拨号
            wellClient.ui.enableBtns(['hold','sTran','sConf','ask','dropCon']);
        }
    },

    conferenced:function(data){
        var $callLines = wellClient.get('.well-callLine');

        $callLines.data('callid', data.callId);

        $callLines.data('state', 'conferenced');

        $('.well-showState').text('会议中');

        // 禁用按钮：接听，保持，转接，挂断
        wellClient.ui.disableBtns(['make','answer','hold','sTran','sConf','ask','conf','cAsk','tran']);

    }
};

// Notification.requestPermission( function(status) {
//   console.log(status); // 仅当值为 "granted" 时显示通知
//   var n = new Notification("15502174013来电", {
//       body: "WellCloud CRM 提醒",
//       icon:"img/delivering.png"
//     }); // 显示通知

//   n.onclick = function(){
//     console.log('nnnnnn');
    
//     n.close();
//   };
// });
