tvu.flashUploader = (function() {
	function flashUploader() {
		var self = this,
			config = tvu.config,
			selfConfig = config.flash,
			uploadObj = null,
			keyToUidMap = {},
			onlyUploadKey; //目前flash不支持上传多个文件，这里暂时记录一下唯一的一个文件的上传key

		function initObj() {
			var flashvars = getFlashVars(),
				htmlArr = [],
				id = selfConfig.id,
				src = selfConfig.src,
				width = selfConfig.width,
				height = selfConfig.height,
				style = selfConfig.style;

			if (tvu.util.userAgent.ie) {
				htmlArr.push('<object id="', id, '" ',
					'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ',
					'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" ',
					'width="', width, '" height="', height, '" style="', style, '">',
					'<param name="scale" value="showall" /><param name="wmode" value="transparent" />',
					'<param name="movie" value="', src, '" />',
					'<param name="flashvars" value="', tvu.util.param(flashvars), '" />',
					'<param name="allowScriptAccess" value="always" /></object>');
			} else {
				htmlArr.push('<embed type="application/x-shockwave-flash" id="', id, '" src="', src, '" ',
					'width="', width, '" height="', height, '" style="', style, '" ',
					'allowScriptAccess="always" scale="showall" wmode="transparent" flashvars="', tvu.util.param(flashvars), '"></embed>');
			}

			$(document.body).append(htmlArr.join(''));

			uploadObj = document.getElementById(selfConfig.id);

			return !!uploadObj
		}

		/**
		 * 1.flashInit(param)：播放器初始化完成。
		 *   param
		 *       objectID:传swf的文件id
		 *       pfversion:flashplayer版本号
		 *
		 * 2.onSelect(fileName, fileSize, code)：选择完文件后调用。
		 *   fileName:文件名称，String
		 *   fileSize:文件大小，Number
		 *   code：
		 *       1790  读取文件异常，一般是超过系统内部文件大小，4G
		 *       1791  当前文件正在上传中，不能上传其他文件
		 *
		 * 3.onProgress(downloadPercent, avSpeed, btyesLoaded, bytesTotal) ： 上传过程进度
		 *   btyesLoaded:已上传字节数，Number
		 *   bytesTotal:目标文件总字节数，Number
		 *
		 * 4.onSent()：文件发送完成
		 *
		 * 5.onSuccess()：文件上传成功完成后触发。
		 *   当otype为json时返回:
		 *   成功 {"s":"o","vid":"78CP39uHYnF"}
		 *   失败{"em":100021,"msg":"system error","s":"f"}
		 *   当otype为xml时返回:
		 *   成功: <root><s>o</s><vid>7y6gL2gywlS</vid></root>
		 *   失败: <root><em>100021</em><msg>system error</msg><s>f</s></root>
		 *
		 *   返回值说明：
		 *   s：处理结果 o-成功 f-失败
		 *   vid：上传视频的VID（仅在上传成功时出现）
		 *   em：错误码（一个整数，仅在出错时出现）
		 *   msg：错误信息（错误描述信息，仅在出错时出现）
		 *
		 * 6.onError(code, msg)：文件上传失败后触发，失败的原因由参数确定。
		 *   code:错误码，Number
		 *   msg:错误信息，String
		 *
		 * 6.onStart(param)： 申请上传完成，开始上传
		 *   param：
		 *   	uin：QQ号
		 *   	vid：视频id
		 *   	fid：服务端文件id
		 */
		function initEvent() {
			window.txvFlashCallback = {};
			window.txvFlashCallback.flashInit = function(param) {
				selfConfig.version = param.pfversion;

				//显示浏览视频界面,参数为可上传的视频类型
				uploadObj.setTypeFilter([{
					name: "视频音频文件",
					type: config.common.fileType
				}]);
			};
			window.txvFlashCallback.onSelect = onSelect;
			window.txvFlashCallback.onProgress = onProgress;
			window.txvFlashCallback.onSent = onSent;
			window.txvFlashCallback.onSuccess = onSuccess;
			window.txvFlashCallback.onError = onFlashError;
		}

		/**
		 * 从配置里获取传给flash的flashvars参数
		 * 1. curl:  当前页面的url地址, 可选参数，如果不传有Flash自己去获得
		 * 2. rurl : 上报信息的CGI地址
		 * 3. surl:  flash上传组件地址
		 * 4. tcgi:  上传校验cgi地址
		 * 5. timeout : 上传到100%后的超时时间,单位:秒,默认30
		 * 6. msize : 允许上传的视频最大大小,单位:M,默认为200
		 * 7. sort: 业务分类，100-boke上传,200-Qzone视频上传,201-Qzone日志上传,202-说说上传,203-Q拍上传,300-weibo上传，400-通用上传，默认为100
		 * 8. uptype :上传方式，1-flash上传，2-控件上传，3-html5上传
		 * 9. show : 1可见，0透明
		 * @return {Object} flashvar参数对象
		 */
		function getFlashVars() {
			var commonConfig = config.common,
				flashVars,
				upcgiUrl;

			upcgiUrl = tvu.util.param({
				g_tk: config.common.g_tk
			}, selfConfig.upcgi);

			flashVars = {
				upcgi: upcgiUrl,
				timeout: commonConfig.timeout,
				show: selfConfig.show,
				g_tk: config.common.g_tk
			};
			return flashVars;
		}

		function onSelect(fileName, fileSize, code) {
			var fio,
				fioArr = [];

			fileName = decodeURIComponent(fileName);

			fio = new tvu.FileInfo(tvu.global.UploadType.FLASH, fileSize, fileName, '', config.common.uploadInfo);
			fio.errorCode = code;
			fio.uploadKey = fio.uid;
			fioArr.push(fio);

			config.event.onSelect(fioArr);
		}

		function onProgress(bytesProcessed, bytesTotal) {
			var fio = self.getFio(onlyUploadKey),
				data = {
					bytesProcessed: bytesProcessed,
					bytesTotal: bytesTotal
				},
				timespan;

			timespan = self.handleProgressData(fio, data);

			if (fio.firstReport == 0) { //第一次上传进度，发送report
				fio.firstReport = 1;

				tvu.reporter.report(tvu.reporter.Step.START, fio);
			}

			if (timespan < 1000) { //最短一秒更新一次
				// return;
			} else if (timespan > 10000 && fio.stopNum < 60) { //大于10秒，算是“停滞恢复”现象

				tvu.reporter.report(tvu.reporter.Step.PAUSE, fio);
				fio.stopNum++;
			}

			config.event.onUploadProgress(fio);
		}

		function onSent() {
			var fio = self.getFio(onlyUploadKey);
			tvu.reporter.report(tvu.reporter.Step.SENT, fio);
		}

		function onSuccess(vid) {
			var fio = self.getFio(onlyUploadKey);

			fio.percent = '100.0';//确保完成之后百分比为100

			tvu.reporter.report(tvu.reporter.Step.FINISHED, fio);

			fio.uploadStatus = tvu.global.UploadStatus.SUCCESS;
			config.event.onSuccess(fio);
		}

		function onFlashError(code, msg) {
			var fio = self.getFio(onlyUploadKey),
				data;

			msg = decodeURIComponent(msg);

			if (code != 0) {
				fio.errorCode = code;
				fio.errorMsg = msg;
				fio.errorType = tvu.reporter.ErrorType.PLUGIN;
				tvu.reporter.report(tvu.reporter.Step.FINISHED, fio);

				onError(fio);
			}
		}

		function onError(fio) {
			fio.uploadStatus = tvu.global.UploadStatus.FAIL;
			config.event.onError(fio);
		}

		function startUpload(fio) {
			
			config.event.onStart(fio);

			self.getVid(fio, function(json) {
				fio.vid = json.vid;
				fio.fid = json.fid;

				tvu.reporter.report(tvu.reporter.Step.BEFORE, fio);

				config.event.onUploadStart(fio);

				uploadFile(fio);

			}, function(json) {
				fio.errorCode = json.em;
				fio.errorMsg = json.msg;
				fio.errorType = tvu.reporter.ErrorType.CGI;
				tvu.reporter.report(tvu.reporter.Step.BEFORE, fio);

				onError(fio);
			});
		}

		function uploadFile(fio) {
			var paramKeys,
				param;

			if(fio.uploadStatus == tvu.global.UploadStatus.CANCEL){
				return;
			}

			paramKeys = selfConfig.upcgiParamKeys;
			param = $.extend({}, fio);

			param = tvu.util.getSubParam(param, paramKeys);
			param.uin = config.common.uin;
			param.g_tk = config.common.g_tk;

			// url = selfConfig.upcgi + '?' + tvu.util.param(param);
			//tvu.util.log('flashUploader start: ' + url);
			
			//将上传key存入uid映射，以供回调时取得对应的fio
			keyToUidMap[fio.uploadKey] = fio.uid;
			onlyUploadKey = fio.uploadKey;

			tvu.reporter.report(tvu.reporter.Step.UPLOADING, fio);

			fio.uploadStatus = tvu.global.UploadStatus.UPLOAD;
			fio.startTime = fio.lastTime = $.now();

			uploadObj.upload(param);
		}

		/* 共有属性和方法 */

		this.inited = false;

		this.keyToUidMap = keyToUidMap;

		this.config = selfConfig;

		this.init = function() {
			if (!self.inited) {
				initObj();
				initEvent();
				self.inited = true;
			}
		};
		this.start = function(fio) {
			if (self.inited) {
				startUpload(fio);
			}
		};
		this.cancel = function(fio) {
			if (self.inited) {
				tvu.reporter.report(tvu.reporter.Step.CANCEL, fio);
				uploadObj.cancel();
			}
		};
		this.isSupport = function() {
			return true;//flash为最终方案，即使用户没有安装也一定会用flash初始化
		};
		this.getSelectButtonOverlay = function() {
			return uploadObj;
		};
	}
	tvu.util.extend(flashUploader, tvu.baseUploader);
	return (new flashUploader());
}());