(function($, wellClient){
var $document = $(document);
var callModel = [];
var activeDeviceId = '';

$document.on('click', '.well-agent-states>ul>li', function(event){
	var $btn = $(event.currentTarget);
	var state = $btn.data('state');

	var $parent = $('#well-changestate');
	if($parent.hasClass('well-disabled')){
		return;
	}

	wellClient.setAgentMode(state);
});

//**************************************************************************************************
//事件驱动ui
wellClient.ui = {};
wellClient.ui.getCallModel = function(){
	return callModel;
};
wellClient.ui.removeOneCall = function(i){
	callModel.splice(i, 1);
};

wellClient.ui.main = function(event){
	var eventName = event.eventName;
	if(typeof wellClient.ui[eventName] === 'function'){
		wellClient.ui[eventName](event);
	}
};

wellClient.ui.setAgentNowState = function(agentStatus){
	$('#well-now-state').text(agentStatus);
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
	var $dest = $('#well-input');
	var phoneNumber = $dest.val();
	phoneNumber = $.trim(phoneNumber);

	if(!/^\d{1,15}$/.test(phoneNumber)){
		$dest.val('号码格式错误');
		return false;
	}

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
		if(call.state === 'established' || call.state === 'held'){	
			this.enableBtn(['drop','hold','consult','single','dest']);
			this.disabledBtn(['answer','make','conference','transfer','cancel']);
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
	var $btn = this.getBtns(['changestate']);

	if(!$btn.hasClass('well-state-ready')){
		$btn.addClass('well-state-ready');
	}

	if($btn.hasClass('well-state-not-ready')){
		$btn.removeClass('well-state-not-ready');
	}
};

wellClient.ui.retrieveCall = function(){
	var call = this.getActiveCall();
	if(call === -1){return;}

	if(call.state === 'held'){
		wellClient.retrieveCall(call.callId);
	}
};

wellClient.ui.setAgentStateNotReady = function(){
	var $btn = this.getBtns(['changestate']);

	if($btn.hasClass('well-state-ready')){
		$btn.removeClass('well-state-ready');
	}

	if(!$btn.hasClass('well-state-not-ready')){
		$btn.addClass('well-state-not-ready');
	}
};

wellClient.ui.agentLoggedOn = function(event){
	this.enableBtn(['make', 'changestate']);
	this.setAgentNowState('已登录');

	event.deviceId = typeof event.deviceId === 'string' ? event.deviceId.split('@')[0] : '';

	$('#well-device').text(event.deviceId);
};

wellClient.ui.agentReady = function(event){
	this.setAgentStateReady();
	this.setAgentNowState('就绪');
};

wellClient.ui.agentNotReady = function(event){
	this.setAgentStateNotReady();
	this.setAgentNowState('未就绪');
};

wellClient.ui.agentLoggedOff = function(){
	this.setAgentNowState('已登出');
	callModel = [];
	this.setAgentNowState('无通话');
	wellClient.ui.disabledBtn(['answer','drop','hold','make','consult','conference','transfer','cancel','single']);
};

wellClient.ui.originated = function(event){
	this.setAgentNowState('呼出中');

	callModel.push({
		state:'originated',
		callId: event.callId,
		deviceId: event.deviceId,
		isCalling: true
	});
};

wellClient.ui.delivered = function(event){
	this.setAgentNowState('振铃中');

	if(event.isCalling){
		// this.enableBtn(['drop']);
		var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
		if(call === -1){return;}
		call = callModel[call];
		call.state = 'delivered';

	}
	else{
		this.enableBtn(['answer','drop']);
		callModel.push({
			state: 'delivered',
			callId: event.callId,
			deviceId: event.deviceId,
			isCalling: false
		});
	}

	this.refreshButtonStatus();
};

wellClient.ui.established = function(event){
	var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
	if(call === -1){return;}

	call = callModel[call];

	call.state = 'established';
	this.setAgentNowState('通话中');

	this.refreshButtonStatus();

	// 通话接通后，清空输入框
	this.clearPhoneNumber();
};

wellClient.ui.clearAllCalls = function(){
	callModel = [];
	this.setAgentNowState('无通话');
	this.refreshButtonStatus();
};

wellClient.ui.connectionCleared = function(event){
	var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
	if(call === -1){return;}

	this.removeOneCall(call);
	if(callModel.length !== 2){
		this.setAgentNowState('无通话');
	}

	this.refreshButtonStatus();
	this.retrieveCall();

	if(event.isClearAll){
		this.clearAllCalls();
	}
};

wellClient.ui.held = function(event){


	var call = wellClient.findItem(callModel, 'deviceId', event.deviceId);
	var activeCall = this.getActiveCall();

	if(call === -1){return;}

	call = callModel[call];
	call.state = 'held';

	this.setAgentNowState('保持中');

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

	this.setAgentNowState('通话中');
	$('#well-hold').text('保持');
	this.refreshButtonStatus();
};


wellClient.ui.conferenced = function(event){
	for(var i=0; i<callModel.length; i++){
		callModel[i].callId = event.callId;
		callModel[i].state = 'conferenced';
	}

	this.setAgentNowState('会议中');
	this.refreshButtonStatus();
};

wellClient.ui.agentWorkingAfterCall = function(){
	this.setAgentNowState('话后处理');
};

//**************************************************************************************************
// 页面上的按钮控制软电话
$document.on('click','.well-btn', function(event){
	var $dest = $(event.currentTarget);
	var id = $dest.attr('id');

	if($dest.hasClass('well-disabled')){
		return;
	}

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
		default: return;
	}
});

$document.on('click', '.well-transfer-dest>ul>li', function(event){
	var phoneNumber = $(event.currentTarget).val();
	phoneNumber = $.trim(phoneNumber);

	if(!phoneNumber){return;}

	var call = wellClient.ui.getActiveCall();
	if(call === -1){return;}

	wellClient.singleStepTransfer(call.callId, phoneNumber);
});

wellClient.ctrl = {};

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
	wellClient.ui.agentLoggedOff();
	wellClient.logout();
};

})($, wellClient);
