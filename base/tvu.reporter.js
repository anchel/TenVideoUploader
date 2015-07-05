tvu.reporter = {
	Step: {
		BEFORE: 1, //上传前，在“申请上传cgi”调用之后上报；
		START: 2, //上传开始，在打开文件之后；
		PAUSE: 3, //上传过程中，提交视频文件和视频信息的过程中，停滞10秒，且连续停滞次数小于60次时；当连续停滞次数达到60次后，不再上报step=3的信息；
		SENT: 4, //上传文件计数达到100%，判定文件传输完毕时，注意这时候上传cgi或服务器未必已经返回最终结果，这点和5不同；
		FINISHED: 5, //cgi返回上传结果，上传cgi或服务器已经返回，说明上传已经完全完成；
		CANCEL: 6, //用户取消
		UPLOADING: 7, //上传正常进行中，暂定每分钟上报一次，需要可配置，不要包含错误码，错误码在其他步骤上报；
		RETRY: 21 //上传发生异常，并准备续传
	},
	ErrorType: {
		NO: 0, //没有错误
		HTTP: 1, //http头部返回错误码
		CGI: 2, //Cgi返回错误码
		PLUGIN: 3 //上传组件（flash html5 控件）返回错误码
	},
	// defaultParam: {
	// 	upid: '',
	// 	vid: '',
	// 	step: '',
	// 	uptype: '',
	// 	curl: '',
	// 	fsize: '0',
	// 	upsize: '0',
	// 	speed: '0',
	// 	duration: '0',
	// 	errcode: '0',
	// 	errtype: '0',
	// 	upcgi: ''
	// },
	report: function(step, fio) {
		var self = this;

		function getUrl(uid) {
			var fio = tvu.global.getFio(uid),
				selfConfig = tvu.global.getUploader(fio.uploadType).config,
				param = {
					step: step,
					sort: tvu.config.common.sort,
					upid: fio.uid,
					uptype: fio.uploadType,
					vid: fio.vid,
					curl: encodeURIComponent(window.location.href),
					fsize: fio.size,
					upsize: fio.processedSize,
					speed: fio.averageSpeed,
					duration: (fio.startTime ? ($.now() - fio.startTime) : 0),
					errcode: fio.errorCode,
					errtype: 0,
					upcgi: ''
				},
				cgiUrl = '',
				cgiUrlBase,
				cgiParamKeys,
				cgiParam,
				url;

			switch (fio.uploadType) {
				case tvu.global.UploadType.FTN:
					$.extend(param, {
						exists: fio.exists,
						serip: fio.serverip,
						fstep: fio.fstep
					});
					break;
				case tvu.global.UploadType.HTML5:
					// $.extend(param, {});
					break;
				case tvu.global.UploadType.FLASH:
					$.extend(param, {
						surl: selfConfig.src,
						pfversion: selfConfig.version
					});
					break;
			}

			if (param.errcode) {
				//根据不同阶段生成不同的upcgi
				var upcgi = ''

                if (step == tvu.reporter.Step.BEFORE) {
					cgiUrlBase = selfConfig.tcgi;
					cgiParamKeys = selfConfig.tcgiParamKeys;
				} else {
					cgiUrlBase = selfConfig.upcgi;
					cgiParamKeys = selfConfig.upcgiParamKeys;
				}

				if (cgiUrlBase) { //如果有相应的cgi url
					cgiParam = $.extend({}, fio);
					cgiParam = tvu.util.getSubParam(cgiParam, cgiParamKeys);
					cgiParam.uin = tvu.config.common.uin;
					cgiParam.g_tk = tvu.config.common.g_tk;

					upcgi = tvu.util.param(cgiParam, cgiUrlBase);
                }

                $.extend(param, {
                    errtype: fio.errorType,
                    upcgi: upcgi
                });
			}

			url = tvu.util.param(param, tvu.config.common.reportCgi);
			return url;
		}

		function send(uid) {
			var url = getUrl(uid);

			tvu.util.log('report: ' + url);
			(new Image()).src = url;

			// $.ajax({
			// 	url: selfConfig.common.reportCgi,
			// 	dataType: 'jsonp',
			// 	type: 'get',
			// 	data: param,
			// 	success: function(json) {},
			// 	error: function(e) {}
			// });
		}

		if (step == tvu.reporter.Step.UPLOADING) { //上传中状态
			if (fio.reportTimer == null) { //心跳timer没初始化，是首次开始上传，启动心跳timer
				send(fio.uid); //首次上报
				fio.reportTimer = setInterval((function(uid) {
					return function() {
						send(uid);
					}
				}(fio.uid)), 60000); //1分钟上报一次 //TODO fstep更新
			}
		} else { //其他状态
			send(fio.uid); //正常上报
			if (fio.reportTimer != null && (
				step == tvu.reporter.Step.SENT ||
				step == tvu.reporter.Step.FINISHED ||
				step == tvu.reporter.Step.CANCEL)) { //上传完成或者失败时，有心跳timer，要清除
				clearInterval(fio.reportTimer);
				fio.reportTimer = null;
			}
		}
	}
};