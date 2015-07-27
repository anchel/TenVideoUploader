tvu.html5Uploader = (function() {
	function html5Uploader() {
		var self = this,
			config = tvu.config,
			selfConfig = config.html5,
			uploadObj = null,
			keyToUidMap = {};

		function initObj() {
			uploadObj = tvu.html5Uploader.core;
			return uploadObj.init();
		}

		function initEvent() {
			uploadObj.onSelect = onSelect;
			uploadObj.onProgress = onProgress;
			uploadObj.onSent = onSent;
			uploadObj.onSuccess = onSuccess;
			uploadObj.onSendError = onSendError;
			uploadObj.onCgiError = onCgiError;

			$(selfConfig.selectButton).bind('click', function(e) {
				uploadObj.openSelectFileWindow();
			});
		}

		function initFio(file) {
			var uid,
				fio;

			fio = new tvu.FileInfo(tvu.global.UploadType.HTML5, file.size, file.name, '', config.common.uploadInfo);
			fio.uploadKey = file.uploadKey;

			return fio;
		}

		function onSelect(fileArr) {
			var fioArr = [],
				fio;
			for (var i = 0, len = fileArr.length; i < len; i++) {
				fio = initFio(fileArr[i]);
				keyToUidMap[fio.uploadKey] = fio.uid;
				fioArr.push(fio);
			}
			config.event.onSelect(fioArr);
		}

		function onProgress(data) {
			var fio = self.getFio(data.uploadKey),
				timespan;

			timespan = self.handleProgressData(fio, data);

			if (fio.firstReport == 0) { //第一次上传进度，发送report
				fio.firstReport = 1;

				tvu.reporter.report(tvu.reporter.Step.START, fio);
			}

			if (timespan < 1000) { //最短一秒更新一次
			} else if (timespan > 10000 && fio.stopNum < 60) { //大于10秒，算是“停滞恢复”现象

				tvu.reporter.report(tvu.reporter.Step.PAUSE, fio);
				fio.stopNum++;
			}

			config.event.onUploadProgress(fio);
		}

		function onSent(data) {
			var fio = self.getFio(data.uploadKey);

			tvu.reporter.report(tvu.reporter.Step.SENT, fio);
		}

		function onSuccess(data) {
			var fio = self.getFio(data.uploadKey);

			fio.percent = '100.0';//确保完成之后百分比为100

			tvu.reporter.report(tvu.reporter.Step.FINISHED, fio);

			fio.uploadStatus = tvu.global.UploadStatus.SUCCESS;
			config.event.onSuccess(fio);
		}

		function onSendError(data) {
			var fio = self.getFio(data.uploadKey);

			fio.errorCode = data.errorCode;
			fio.errorType = tvu.reporter.ErrorType.PLUGIN;
			tvu.reporter.report(tvu.reporter.Step.FINISHED, fio);

			onError(fio);
		}

		function onCgiError(data) {
			var fio = self.getFio(data.uploadKey);

			fio.errorCode = data.errorCode;
			fio.errorMsg = data.errorMsg;
			fio.errorType = tvu.reporter.ErrorType.CGI;
			tvu.reporter.report(tvu.reporter.Step.FINISHED, fio);

			onError(fio);
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
			if(fio.uploadStatus == tvu.global.UploadStatus.CANCEL){
				return;
			}
			
			tvu.reporter.report(tvu.reporter.Step.UPLOADING, fio);

			fio.startTime = fio.lastTime = $.now();
			fio.uploadStatus = tvu.global.UploadStatus.UPLOAD;

			uploadObj.start(fio);
		}
		/* 共有属性和方法 */

		this.inited = false;

		this.keyToUidMap = keyToUidMap;

		this.config = selfConfig;

		this.init = function() {
			if (!this.inited) {
				initObj();
				initEvent();
				this.inited = true;
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
				uploadObj.cancel(fio);
			}
		};
		this.openSelectFileWindow = function() {
			if (self.inited) {
				uploadObj.openSelectFileWindow();
			}
		};
		this.isSupport = function() {
			return (window.File != undefined && window.FormData != undefined && (new window.XMLHttpRequest).upload != undefined);
			// return false;
		};
	}
	tvu.util.extend(html5Uploader, tvu.baseUploader);
	return (new html5Uploader());
}());