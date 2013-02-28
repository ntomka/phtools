var RequestSender = {
	rs: new Class( {
		initialize: function ( reqObj, userCallBack ) {
			this.requestSender = chrome.extension.sendRequest;

			this.reqObj = reqObj;
			this.userCallBack = userCallBack;
		},
		callBack: function ( response ) {
			this.userCallBack( response );
		},
		sendRequest: function () {
			this.requestSender( this.reqObj, this.callBack.bind( this ) );
		}
	} ),
	sendRequest: function ( reqObj, userCallBack ) {
		var rs = new this.rs( reqObj, userCallBack );
		rs.sendRequest();
	}
};