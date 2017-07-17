(function($, wellClient){

var $document = $(document);
var callModel = [];
var activeDeviceId = '';

// set agent Mode
$document.on('change', '#well-changestate', function(event){
	var $select = $(this);
	var state = $select.val();
	var mode = '';
	var reason = '';

	if($select.hasClass('well-disabled') || state === ''){
		return;
	}

	mode = state.split(':')[0];
	reason = state.split(':')[1];

	wellClient.setAgentMode(mode, reason)
	.fail(function(res){
		if(res.status === 460){
			wellClient.ui.status.renderAgentStatus();
		}
	});
	$select.val('');
});

$document.on('click', '.well-show-state', function(){
	wellClient.uploadLog();
});

//**************************************************************************************************
//事件驱动ui
wellClient.ui = {};
wellClient.ui.status = {
	agentStatus: '',
	deviceStatus: '',
	mixStatus: '',
	reason: '',
	statusList:{
		// agent status
		'agentReady': '就绪',
		'agentNotReady': '示忙',
		'agentWorkingAfterCall': '话后处理',
		'agentLoggedOff': '未登录',
		'agentAllocated': '预占中',
		'agentLoggedOn': '已登录',

		// device status
		'originated': '呼出中',
		'delivered': '振铃中',
		'established': '通话中',
		'held':'保持中',
		'conferenced': '会议中',
		'retrieved': '通话中'
	},
	renderAgentStatus: function(reason){

		if(this.agentStatus === 'agentNotReady'){
			this.reason = reason || this.reason;

			if(reason === '2'){
				wellClient.ui.manualCallOut();
			}
			else{
				wellClient.ui.setAgentStateNotReady();
			}
		}
		else if(this.agentStatus === 'agentReady'){
			wellClient.ui.setAgentStateReady();
		}
		else if(this.agentStatus === 'agentWorkingAfterCall'){
			this.reason = 1;
			wellClient.ui.setAgentStateNotReady();
		}
	},
	receiveEvent: function(eventName, reason){
		if(/agent/.test(eventName)){
			this.reason = reason || this.reason;
			this.agentStatus = eventName;
			this.mixStatus =  eventName;
		}
		else if(eventName === 'connectionCleared'){

			var call = wellClient.ui.getActiveCall();
			if(call === -1){
				this.deviceStatus = eventName;
				this.mixStatus = this.agentStatus;
			}
			else{
				this.deviceStatus = call.state;
				this.mixStatus = call.state;
			}
		}
		else{
			this.deviceStatus = eventName;
			this.mixStatus = this.deviceStatus;
		}
		this.renderCurrentStatus();
		this.renderAgentStatus(reason);
	},
	transferStatus: function(status){
		if(this.statusList[status]){
			if(status === 'agentNotReady' && this.reason == '2'){
				return '手工外呼';
			}
			return this.statusList[status];
		}
		else{
			return '';
		}
	},
	renderCurrentStatus: function(){
		var status = this.mixStatus;
		status = this.transferStatus(status);
		wellClient.ui.setAgentNowState(status);
	}
};

wellClient.ui.getCallModel = function(){
	return callModel;
};

wellClient.ui.removeOneCall = function(i){
	callModel.splice(i, 1);
};

wellClient.ui.manualCallOut = function(){
	$('#well-changestate').val('NotReady:2');
	this.setAgentNowState('手工外呼');
};

wellClient.ui.main = function(event){
	var eventName = event.eventName;
	if(typeof wellClient.ui[eventName] === 'function'){
		wellClient.ui[eventName](event);
	}
};

wellClient.ui.setPendingMode = function(event){
	console.log('come in wellClient.ui.setPendingMode');
	$('#well-changestate').addClass('well-pending');
};

wellClient.ui.removePendingMode = function(){
	$('#well-changestate').removeClass('well-pending');
};

wellClient.ui.wsDisconnected = function(event){
	this.setAgentNowState('WebSocket已断开');
};

wellClient.ui.agentAllocated = function(event){
	this.status.receiveEvent(event.eventName);
};

wellClient.ui.setAgentNowState = function(agentStatus){
	$('#well-now-state').text(agentStatus);
};

wellClient.ui.getAgentNowState = function(){
	return $('#well-now-state').text();
};

wellClient.ui.getBtns = function(btnIdList){
	var btns = '#well-'+btnIdList.join(',#well-');
	return $(btns);
};

wellClient.ui.enableBtn = function(btnIdList){
	var $btns = this.getBtns(btnIdList);
	$btns.removeClass('well-disabled');
};

wellClient.ui.clearPhoneNumber = function(){
	$('#well-input').val('');
};

wellClient.ui.getPhoneNumber = function(){
	// var $dest = $('#well-input');
	var $dest = $('#well-phone-number');
	var phoneNumber = $dest.val();
	phoneNumber = $.trim(phoneNumber);

	if(phoneNumber === ''){
		// $dest.val('号码格式错误');
		this.createWebNotification('未选择对方号码');
		return false;
	}
	$dest.val('');

	return phoneNumber;
};

wellClient.ui.disabledBtn = function(btnIdList){
	var $btns = this.getBtns(btnIdList);
	$btns.addClass('well-disabled');
};

wellClient.ui.handleDeliveredState = function(){
	var call = this.getActiveCall();
	// 外呼只能高亮挂断
	if(call.isCalling){
		this.enableBtn(['drop']);
		this.disabledBtn(['answer','make','conference','transfer','cancel','hold','consult','single','dest']);
	}
	else{
	// 客户呼入只能接听或者挂断
		this.enableBtn(['answer','drop']);
		this.disabledBtn(['make','conference','transfer','cancel','hold','consult','single','dest']);
	}
};

wellClient.ui.handleConference = function(){
	this.enableBtn(['drop']);
	this.disabledBtn(['answer','make','conference','transfer','cancel','hold','consult','single','dest']);
};

wellClient.ui.refreshButtonStatus = function(){
	var length = callModel.length;
	var call = this.getActiveCall();

	if(length === 0){
		this.enableBtn(['make']);
		this.disabledBtn(['answer', 'drop', 'hold', 'consult', 'conference', 'transfer', 'cancel', 'single','dest']);
	}
	else if(length === 1){
		// 一条线路在通话中
		if(call.state === 'established'){
			this.enableBtn(['drop','hold','consult','single','dest']);
			this.disabledBtn(['answer','make','conference','transfer','cancel']);
		}
		else if(call.state === 'held'){
			this.enableBtn(['hold']);
			this.disabledBtn(['drop','answer','make','conference','transfer','cancel','consult','single','dest']);
		}
		else if(call.state === 'delivered'){
			this.handleDeliveredState();
		}
		else if(call.state === 'conferenced'){
			this.handleConference();
		}

	}
	else if(length === 2){

		if(call.state === 'delivered'){
			this.handleDeliveredState();
		}
		else if(call.state === 'conferenced'){
			this.handleConference();
		}
		else{
			// 两条线路时，不允许挂断，只能接回
			this.enableBtn(['hold','conference','transfer','cancel']);
			this.disabledBtn(['drop','answer','make','consult','single','dest']);
		}
	}
};

wellClient.ui.getActiveCall = function(){
	if(callModel.length === 0){
		return -1;
	}

	return callModel[callModel.length - 1];
};

wellClient.ui.setAgentStateReady = function(){
	this.removePendingMode();
	var $select = $('#well-changestate')
	$select.val('Ready:');
};

wellClient.ui.retrieveCall = function(){
	var call = this.getActiveCall();
	if(call === -1){return;}

	if(call.state === 'held'){
		wellClient.retrieveCall(call.callId);
	}
};

wellClient.ui.setAgentStateNotReady = function(){
	this.removePendingMode();

	var reason = wellClient.ui.status.reason || 1;

	var $select = $('#well-changestate');
	$select.val('NotReady:'+reason);
};

// from event
wellClient.ui.agentLoggedOn = function(event){
	this.enableBtn(['make', 'changestate']);

	this.status.receiveEvent(event.eventName);

	event.deviceId = typeof event.deviceId === 'string' ? event.deviceId.split('@')[0] : '';
	$('#well-device').text(event.deviceId);
	$('#well-login-info').hide();
	$('#well-login').hide();
	$('#well-logout').removeClass('well-dn');
};

wellClient.ui.agentReady = function(event){
	this.setAgentStateReady();
	this.status.receiveEvent(event.eventName);
};

wellClient.ui.agentNotReady = function(event){
	this.status.receiveEvent(event.eventName, event.reason);
};

wellClient.ui.agentLoggedOff = function(event){
	callModel = [];
	this.removePendingMode();
	this.status.receiveEvent(event.eventName);
	wellClient.ui.disabledBtn(['answer','drop','hold','make','consult','conference','transfer','cancel','single']);
	$('#well-login-info').show();
	$('#well-login').show();
	$('#well-logout').addClass('well-dn');
	$('#well-hold').text('保持');
	$('#well-device').text('分机号');
};

wellClient.ui.delivered = function(event){
	this.status.receiveEvent(event.eventName);

	callModel.push({
		state: 'delivered',
		callId: event.callId,
		deviceId: event.deviceId,
		isCalling: event.isCalling
	});

	if(!event.isCalling && event.autoAnswer){
		wellClient.ctrl.answerCall();
	}
	else{
		this.refreshButtonStatus();
	}
};

wellClient.ui.established = function(event){
	var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
	if(call === -1){return;}

	call = callModel[call];

	call.state = 'established';
	this.status.receiveEvent(event.eventName);

	this.refreshButtonStatus();

	// 通话接通后，清空输入框
	this.clearPhoneNumber();
};

wellClient.ui.clearAllCalls = function(){
	callModel = [];
	this.refreshButtonStatus();
};

wellClient.ui.connectionCleared = function(event){
	// var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
	// if(call === -1){return;}
	var call;

	if(event.isClearAll){
		this.clearAllCalls();
		this.status.receiveEvent(event.eventName);
		return;
	}
	else{
		call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
		if(call === -1){return;}
		this.removeOneCall(call);
		this.status.receiveEvent(event.eventName);
		this.refreshButtonStatus();
	}

	call = this.getActiveCall();

	if(call === -1){return;}

	if(call.state === 'held'){
		this.retrieveCall();
	}
	else if(call.state === 'conferenced'){
		call.state = 'established';
		this.status.receiveEvent(event.eventName);
	}
};

wellClient.ui.held = function(event){


	var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
	var activeCall = this.getActiveCall();

	if(call === -1){return;}

	call = callModel[call];
	call.state = 'held';

	this.status.receiveEvent(event.eventName);

	if(call.deviceId === activeCall.deviceId){
		$('#well-hold').text('取回');
	}

	this.refreshButtonStatus();
};

wellClient.ui.retrieved = function(event){
	var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
	if(call === -1){return;}

	call = callModel[call];
	call.state = 'established';
	this.status.receiveEvent(event.eventName);

	$('#well-hold').text('保持');
	this.refreshButtonStatus();
};


wellClient.ui.conferenced = function(event){
	for(var i=0; i<callModel.length; i++){
		callModel[i].callId = event.callId;
		callModel[i].state = 'conferenced';
	}

	this.status.receiveEvent(event.eventName);
	this.refreshButtonStatus();
};

wellClient.ui.cancelConferenced = function(event){
	if(callModel.length === 1){
		callModel[0].state = 'established';
		wellClient.ui.setAgentNowState('通话中');
	}
};

wellClient.ui.agentWorkingAfterCall = function(event){

	this.removePendingMode();
	this.status.receiveEvent(event.eventName, 1);
};

wellClient.ui.createWebNotification = function(msg){
    if(!window.Notification){
        return;
    }


    Notification.requestPermission( function(status) {
        console.log(status); // 仅当值为 "granted" 时显示通知
        wellClient.ui.webNotification = new Notification(msg, {
            body: "wellClient 提醒",
            icon:"public/img/warning.png",
            tag:'wellClient'
        }); // 显示通知

        wellClient.ui.webNotification.onclick = function(){
            wellClient.ui.webNotification.close();
            wellClient.ui.webNotification = null;
        };
    });
};

//**************************************************************************************************
// 页面上的按钮控制软电话
$document.on('click','.well-btn', function(event){
	var $dest = $(event.currentTarget);
	var id = $dest.attr('id');

	if($dest.hasClass('well-disabled')){
		return;
	}

	if(!id){
		return;
	}

	wellClient.ctrl.beforeDeliver(id);
});

// $document.on('click', '.well-transfer-dest', function(event){
$document.on('change', '#well-dest', function(event){
	$select = $('#well-dest');

	if($select.hasClass('well-disabled')){
		return;
	}

	var phoneNumber = $select.val();
	phoneNumber = $.trim(phoneNumber);

	if(!phoneNumber){return;}

	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	wellClient.singleStepTransfer(call.callId, phoneNumber);
	$select.val('');

});

wellClient.ctrl = {};

wellClient.ctrl.beforeDeliver = function(id){
	clearTimeout(wellClient.ctrl.timeoutId);

	(function(id){
		wellClient.ctrl.timeoutId = setTimeout(function(){
				wellClient.ctrl.deliverMethod(id);
		}, 500);
	})(id);
};

wellClient.ctrl.deliverMethod = function(id){

	switch(id){
		case 'well-make': return wellClient.ctrl.makeCall();
		case 'well-answer': return wellClient.ctrl.answerCall();
		case 'well-drop': return wellClient.ctrl.dropCall();
		case 'well-hold': return wellClient.ctrl.holdCall();
		case 'well-single': return wellClient.ctrl.singleCall();
		case 'well-consult': return wellClient.ctrl.consultCall();
		case 'well-cancel': return wellClient.ctrl.cancelCall();
		case 'well-transfer': return wellClient.ctrl.transferCall();
		case 'well-conference': return wellClient.ctrl.conferenceCall();
		case 'well-logout': return wellClient.ctrl.logout();
		case 'well-login': return wellClient.ctrl.login();
		default: return;
	}
};

wellClient.ctrl.makeCall = function(){
	var phoneNumber = wellClient.ui.getPhoneNumber();
	if(phoneNumber === false){
		return;
	}

	wellClient.makeCall(phoneNumber);
};

wellClient.ctrl.answerCall = function(){
	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	wellClient.answerCall(call.callId);
};

wellClient.ctrl.dropCall = function(){
	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	wellClient.dropConnection(call.callId);
};

wellClient.ctrl.holdCall = function(){
	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	var $btn = $('#well-hold');
	var text = $btn.text();

	if(text === '保持'){
		wellClient.holdCall(call.callId);
	}
	else{
		wellClient.retrieveCall(call.callId);
	}
};

wellClient.ctrl.singleCall = function(){
	var phoneNumber = wellClient.ui.getPhoneNumber();
	if(phoneNumber === false){return;}

	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	wellClient.singleStepTransfer(call.callId, phoneNumber);
};

wellClient.ctrl.consultCall = function(){
	var phoneNumber = wellClient.ui.getPhoneNumber();
	if(phoneNumber === false){return;}

	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	wellClient.consult(call.callId, phoneNumber);
};

wellClient.ctrl.cancelCall = function(){
	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	if(callModel.length !== 2){return;}
	var heldCall = callModel[0];

	wellClient.cancelConsult(heldCall.callId, call.callId);
};

wellClient.ctrl.transferCall = function(){
	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	if(callModel.length !== 2){return;}
	var heldCall = callModel[0];

	wellClient.transferCall(heldCall.callId, call.callId);
};

wellClient.ctrl.conferenceCall = function(){
	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	if(callModel.length !== 2){return;}
	var heldCall = callModel[0];

	wellClient.conference(heldCall.callId, call.callId);
};

wellClient.ctrl.logout = function(){
	if(callModel.length != 0){
		alert('当前正在通话中，无法签出!');
		return;
	}

	wellClient.logout();
};

wellClient.ctrl.login = function(){
	var $login = $('#well-login');
	var $loading = $('#well-loading');

	var code = $('#well-code').val();
	var password = $('#well-password').val();
	var namespace = $('#well-namespace').val();
	var deviceId = $('#well-deviceId').val();

	if(!code || !password || !namespace || !deviceId){
		alert('工号，密码，域名，分机号都是必填项');
		return;
	}

	$loading.removeClass('well-dn');
	$login.hide();

	wellClient.agentLogin({
		jobNumber: code,
		password: password,
		domain: namespace,
		ext: deviceId,
		agentMode: 'NotReady',
		loginMode: 'force'
	})
	.done(function(res){
		if(!window.localStorage){return;}
		localStorage.setItem('code', code);
		localStorage.setItem('password', password);
		localStorage.setItem('namespace', namespace);
		localStorage.setItem('deviceId', deviceId);
	})
	.fail(function(res){
		var errorMsg = {
			eventName: 'loginFailed',
			status: res.status,
			responseText: res.responseText,
		};

		// console.log(JSON.stringify(res));

		wellClient.triggerInnerOn(errorMsg);
	})
	.always(function(){
		if(!wellClient.isLogined()){
			$login.show();
		}
		$loading.addClass('well-dn');
		$login.removeAttr('disabled');
	});
};


})($, wellClient);
