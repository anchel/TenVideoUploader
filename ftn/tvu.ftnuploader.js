tvu.ftnUploader = (function() {
	function ftnUploader() {
		var self = this,
			config = tvu.config,
			selfConfig = config.ftn,
			uploadObj = null,
			keyToUidMap = {};

		function initObj() {
			var htmlArr = [];
			if (!uploadObj) {
				if (tvu.util.userAgent.ie) {
					try {
						uploadObj = new ActiveXObject("TXFTNActiveX.FTNUpload");
					} catch (ex) {
						tvu.util.log('ftn activex init fail');
					}
				} else if (navigator.mimeTypes && navigator.mimeTypes["application/txftn-webkit"]) {
					htmlArr.push('<div style="', selfConfig.containerStyle, '"><embed id="', selfConfig.id, '" type="application/txftn-webkit" style="', selfConfig.style, '"></embed></div>');
					$(document.body).append(htmlArr.join(''));

					uploadObj = document.getElementById(selfConfig.id);
				} else {
					tvu.util.log('ftn webkit init fail');
				}
			}

			return !!uploadObj
		}

		function initEvent() {
			uploadObj.OnEvent = onAllInOneEvent;

			uploadObj.BlockSize = selfConfig.blockSize;
			try {
				uploadObj.TimeOut = config.common.timeout * 1000;
			} catch (ex) {
				tvu.util.log('ftn set timeout fail');
			}

			$(selfConfig.selectButton).bind('click', function(e) {
				selectFile();
				e.preventDefault();
			});
		}

		function selectFile() {
			var pathArr,
				tmpPath,
				fioArr = [];

			if (!self.inited) {
				return;
			}

			if (tvu.util.userAgent.firefox) {
				uploadObj.focus();
			}

			if (!config.useMultiSelect && typeof uploadObj.SelectFile != 'undefined') { //webkit版文件单选接口无效
				pathArr = uploadObj.SelectFile(window);
			} else {
				pathArr = uploadObj.SelectFiles(window);
			}

			if (!pathArr) {
				return;
			}

			pathArr = pathArr.replace(/^\r\n/, '').replace(/\r\n$/, '').split('\r\n');

			// if (!config.useMultiSelect && files.length > 1) {
			// 	onError(9004, conf.plugin.msg.check.oneFile, null);
			// 	return;
			// }

			for (var i = 0, len = pathArr.length; i < len; i++) {
				tmpPath = pathArr[i];
				if (tmpPath) {
					fioArr.push(initFio(tmpPath));
				}
			};

			onSelect(fioArr);
		}

		function initFio(path) {
			var size,
				name,
				fio;

			if (typeof uploadObj.GetFileSizeString != 'undefined') { //webkit版接口无效
				size = uploadObj.GetFileSizeString(path);
			} else {
				size = uploadObj.GetFileSize(path); //4G以上取得的文件大小不正确，为%4G得到的余数
			}
			size = Math.abs(size || 0);

			name = tvu.util.getFileName(path);

			fio = new tvu.FileInfo(tvu.global.UploadType.FTN, size, name, path, config.common.uploadInfo);

			return fio;
		}

		function onSelect(fioArr) {
			config.event.onSelect(fioArr);
		}

		function onScanned(data) {
			var fio = self.getFio(data.uploadKey);

			fio.md5 = data.md5;
			fio.sha = data.sha;
			fio.sha3 = data.sha3;

			//重置扫描时存入的数据
			fio.percent = 0;
			fio.averageSpeed = 0;
			fio.instantSpeed = 0;
			fio.processedSize = 0;
			fio.startSize = 0;

			self.getVid(fio, function(json) {
				fio.exists = json.exists;
				fio.checkkey = json.checkkey;
				fio.vid = json.vid;
				fio.fid = json.fid;
				fio.serverip = json.serverip;
				fio.serverport = json.serverport;

				tvu.reporter.report(tvu.reporter.Step.BEFORE, fio);

				config.event.onUploadStart(fio);

				tvu.reporter.report(tvu.reporter.Step.UPLOADING, fio);

				//因为会有自动重试调用uploadFile，时间和初始化和该状态放此处
				fio.uploadStatus = tvu.global.UploadStatus.UPLOAD;
				fio.startTime = fio.lastTime = $.now();


				uploadFile(fio);
			}, function(json) {
				fio.errorCode = json.em;
				fio.errorMsg = json.msg;
				fio.errorType = tvu.reporter.ErrorType.CGI;

				tvu.reporter.report(tvu.reporter.Step.BEFORE, fio);
				onError(fio);
			});
		}

		function onScanProgress(data) {
			var fio = self.getFio(data.uploadKey),
				timespan;

			timespan = self.handleProgressData(fio, data);

			config.event.onScanProgress(fio);
		}

		function onSendProgress(data) {
			var fio = self.getFio(data.uploadKey),
				timespan;

			timespan = self.handleProgressData(fio, data, true);

			if (timespan == 0) { //进度无效跳过
				return;
			}

			if (fio.firstReport == 0) { //第一次上传进度，发送report
				fio.firstReport = 1;

				tvu.reporter.report(tvu.reporter.Step.START, fio);
			}

			if (timespan < 1000) { //最短一秒更新一次
			} else if (timespan > 10000 && fio.stopNum < 60) { //大于10秒，算是“停滞恢复”现象
				fio.fstep = data.fstep;
				tvu.reporter.report(tvu.reporter.Step.PAUSE, fio);
				fio.stopNum++;
			}
			config.event.onUploadProgress(fio);
		}

		function onSent(data) {
			var fio = self.getFio(data.uploadKey);

			fio.fstep = data.fstep;
			tvu.reporter.report(tvu.reporter.Step.SENT, fio);
		}

		function onSuccess(data) {
			var fio = self.getFio(data.uploadKey);

			fio.percent = '100.0'; //确保完成之后百分比为100

			fio.fstep = data.fstep;
			tvu.reporter.report(tvu.reporter.Step.FINISHED, fio);

			fio.uploadStatus = tvu.global.UploadStatus.SUCCESS;
			config.event.onSuccess(fio);
		}

		function onScanError(data) {
			var fio = self.getFio(data.uploadKey);

			fio.errorCode = data.errorCode;
			fio.errorType = tvu.reporter.ErrorType.PLUGIN;
			fio.fstep = data.fstep;
			tvu.reporter.report(tvu.reporter.Step.PAUSE, fio); //扫描失败用停滞的step

			onError(fio);
		}

		function onSendError(data) {
			var fio = self.getFio(data.uploadKey);

			fio.errorCode = data.errorCode;
			fio.errorType = tvu.reporter.ErrorType.PLUGIN;
			fio.fstep = data.fstep;

			if (selfConfig.autoRetry && fio.autoRetryNum < selfConfig.maxAutoRetryNum) { //上传出错，仍可自动续传
				fio.autoRetryNum++;

				// self.handleProgressData(fio, data, true);
				// onProgress(fio);
				// tvu.util.log('ftn autoretry: ' + fio.uid + ', ' + fio.vid + ', ' + fio.name + ', ' + fio.percent + '%, ' + fio.speed + 'B/s');

				tvu.reporter.report(tvu.reporter.Step.RETRY, fio);
				uploadFile(fio);
			} else {

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

			startScan(fio);
		}

		function startScan(fio) {
			fio.uploadStatus = tvu.global.UploadStatus.SCAN;
			fio.startTime = fio.lastTime = $.now();
			fio.uploadKey = uploadObj.FileSign(fio.path, fio.uid);
			keyToUidMap[fio.uploadKey] = fio.uid;
		}

		function uploadFile(fio) {
			if(fio.uploadStatus == tvu.global.UploadStatus.CANCEL){
				return;
			}
			delete keyToUidMap[fio.uploadKey];
			fio.uploadKey = uploadObj.UploadFile(fio.serverip, fio.serverport, fio.checkkey, fio.sha, '/' + fio.vid, fio.path, fio.uid);
			keyToUidMap[fio.uploadKey] = fio.uid;
		}

		function onAllInOneEvent(eventParam) {
			var uploadKey;

			if (!eventParam || !eventParam.LocalID) {
				return;
			}

			uploadKey = eventParam.LocalID;

			switch (eventParam.EventType) {
				case 1: //文件扫描结束		
					if (eventParam.ErrorCode == 0 && eventParam.Step == 0) { //扫描成功
						onScanned({
							uploadKey: uploadKey,
							md5: eventParam.Md5,
							sha: eventParam.SHA,
							sha3: eventParam.SHA3,
							fstep: eventParam.Step
						});
					} else { //扫描失败
						onScanError({
							uploadKey: uploadKey,
							errorCode: eventParam.ErrorCode,
							fstep: eventParam.Step
						});
					}
					break;
				case 2: //扫描中进度
					onScanProgress({
						uploadKey: uploadKey,
						bytesProcessed: (eventParam.Processed >>> 0), //TODO 处理4G大文件，目前4G以下
						bytesTotal: (eventParam.FileSize >>> 0),
						fstep: eventParam.Step
					});
					break;
				case 3: //上传结束
					if (eventParam.ErrorCode == 0 && eventParam.Step == 0) { //视频成功上传 
						//ftn不能区分文件发送完成和cgi返回成功，所以在这依次回调
						onSent({
							uploadKey: uploadKey,
							fstep: eventParam.Step
						});

						onSuccess({
							uploadKey: uploadKey,
							fstep: eventParam.Step
						});
					} else { //上传失败
						onSendError({
							uploadKey: uploadKey,
							errorCode: eventParam.ErrorCode,
							fstep: eventParam.Step
						});
					}
					break;
				case 4: //上传中进度
					onSendProgress({
						uploadKey: uploadKey,
						bytesProcessed: (eventParam.Processed >>> 0),
						bytesTotal: (eventParam.FileSize >>> 0),
						fstep: eventParam.Step
					});
					break;
			}
		}

		/* 共有属性和方法 */

		this.inited = false;

		this.keyToUidMap = keyToUidMap;

		this.config = selfConfig;

		this.init = function() {
			if (!self.inited) {
				if (!initObj()) { //初始化失败
					// onError(9001);
					return;
				}
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
				if (fio.uploadStatus == tvu.global.UploadStatus.SCAN) {
					if (typeof uploadObj.StopFileSign != 'undefined') {
						uploadObj.StopFileSign(fio.uploadKey);
					}
				} else if (fio.uploadStatus == tvu.global.UploadStatus.UPLOAD) {
					uploadObj.StopUpload(fio.uploadKey);
				}
			}
		};
		this.isSupport = function() {
			return initObj();
		};
		this.selectFile = function(path, vid) {
			var fio = null;
			if (self.inited && path) {
				fio = initFio(path, vid);
				vid && (fio.vid = vid);
				onSelect([fio]);
			}
			return fio;
		};
		this.openSelectFileWindow = function() {
			if (self.inited) {
				selectFile();
			}
		};
	}
	tvu.util.extend(ftnUploader, tvu.baseUploader);
	return (new ftnUploader());
}());