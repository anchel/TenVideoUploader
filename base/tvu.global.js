tvu.global = {
	fios: {},
	BusinessType: {
		COMMON: 'common',
		BOKE: 'boke',
		QZONE: 'qzone',
		WEIBO: 'weibo',
        CLASS: 'class',
        WEIXIN : 'weixin'
	},
	UploadType: {
		FTN: 2,
		HTML5: 3,
		FLASH: 1,
		FTN_HTML5: 4
	},
	UploadStatus: {
		READY: 0,
		SCAN: 1,
		UPLOAD: 2,
		SUCCESS: 3,
		CANCEL: 4,
		FAIL: 5,
		INVALID: 6
	},
	/**
	 * 错误信息
	 * @type {Object}
	 */
	ErrorCode: {
		'1001': '未登录',
		'1791': 'Flash正在上传不能选择文件',//TODO 降级控制
		'7000': '暂不支持该格式',
		'7001': '文件没有扩展名',
		'7002': '文件名超长',
		'7003': '文件超过限制大小',
		'7004': '文件大小为0',
		'8001': '文件发送时出现错误',
		'8002': '上传CGI返回未知错误',
		'8003': '上传CGI返回超时',
		'9002': '申请上传返回值为空',
		'9003': '申请上传调用失败'
	},
	errorCodeMap: {
		'': ''
	},
	getUploaderName: function(uploadType) {
		var name = '';
		switch (uploadType) {
			case tvu.global.UploadType.FTN:
				name = 'ftn';
				break;
			case tvu.global.UploadType.FTN_HTML5:
                name = 'ftnhtml5';
                break;
			case tvu.global.UploadType.HTML5:
				name = 'html5';
				break;
			case tvu.global.UploadType.FLASH:
				name = 'flash';
				break;
		}
		return name;
	},
	getUploader: function(uploadType) {
		var name = this.getUploaderName(uploadType),
			uploader = null;
		if (name) {
			uploader = tvu[name + 'Uploader'];
		}
		return uploader;
	},
	// getConfig: function(uploadType) {
	// 	var name = this.getUploaderName(uploadType),
	// 		config = null;
	// 	if (name) {
	// 		config = config[name];
	// 	}
	// 	return config;
	// },
	addFio: function(fio) {
		if (fio && !this.fios[fio.uid]) { //所有文件信息中不存在才加入
			this.fios[fio.uid] = fio;
		}
	},
	getFio: function(uid) {
		return (this.fios[uid] || null);
	},
	getErrorMsg: function(code) {
		return (this.ErrorCode[code] || '');
	}
};