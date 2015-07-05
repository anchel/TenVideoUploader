tvu.html5Uploader.core = (function() {
	function html5UploaderCore() {
		var self = this,
			config = tvu.config,
			selfConfig = config.html5,
			keyToFileMap = {},
			inputObj;

		function initObj() {
			var html = '<div style="' + selfConfig.containerStyle + '"><input name="Filedata" type="file" id="' + selfConfig.id + '" style="' + selfConfig.style + '" width="' + selfConfig.width + '" height="' + selfConfig.height + '"' + (config.common.useMultiSelect ? ' multiple="multiple"' : '') + ' /></div>';
			$(document.body).append(html);

			inputObj = document.getElementById(selfConfig.id);
			return !!inputObj;
		}

		function initEvent() {
			var dragTarget = document.body,
				minDragTimespan = 10, //拖入拖出的最短时间间隔，用以排除子元素间拖拽
				dragEnterTimePage,
				dragEnterTimeTarget;

			!selfConfig.dropTarget && (selfConfig.dropTarget = document.body);

			/* 感应区域事件 */

			//拖进，阻止冒泡和清除默认行为
			// dragTarget.bind('dragenter', function(e) {
			dragTarget.addEventListener('dragenter', function(e) {
				e.preventDefault();
				e.stopPropagation();
				// tvu.util.log('in: ' + e.target.id);
				dragEnterTimePage = $.now();
				config.event.onDragEnterPage();
			}, false);
			// });

			//拖出，阻止冒泡和清除默认行为
			// dragTarget.bind('dragleave', function(e) {
			dragTarget.addEventListener('dragleave', function(e) {
				e.stopPropagation();
				e.preventDefault();
				// tvu.util.log('out: ' + e.target.id);
				if ($.now() - dragEnterTimePage > minDragTimespan) { //
					config.event.onDragLeavePage();
				}
			}, false);
			// });

			//拖来拖去, dragover事件时一定要清除默认事件，不然会无法触发后面的drop事件
			// dragTarget.bind('dragover', function(e) {
			dragTarget.addEventListener('dragover', function(e) {
				e.preventDefault();
				e.stopPropagation();
			}, false);
			// });

			//释放，阻止冒泡和清除默认行为
			// dragTarget.bind('drop', function(e) {
			dragTarget.addEventListener('drop', function(e) {
				e.preventDefault();
				e.stopPropagation();

				config.event.onDragLeavePage();
			}, false);
			// });

			/* 释放区域事件，不需要dragover，body感应区域已有 */

			//拖进。不用阻止冒泡和清除默认行为，留给body感应区域
			// selfConfig.dropTarget.bind('dragenter', function(e) {
			selfConfig.dropTarget.addEventListener('dragenter', function(e) {
				dragEnterTimeTarget = $.now();
				config.event.onDragEnterTarget();
			}, false);
			// });

			//拖出。不用阻止冒泡和清除默认行为，留给body感应区域
			// selfConfig.dropTarget.bind('dragleave', function(e) {
			selfConfig.dropTarget.addEventListener('dragleave', function(e) {
				if ($.now() - dragEnterTimeTarget > minDragTimespan) { //
					config.event.onDragLeaveTarget();
				}
			}, false);
			// });

			//释放，读取文件。不用阻止冒泡和清除默认行为，留给body感应区域
			// selfConfig.dropTarget.bind('drop', function(e) {
			selfConfig.dropTarget.addEventListener('drop', function(e) {
				var fileArr;

				config.event.onDragLeaveTarget();
				config.event.onDropTarget();

				fileArr = e.dataTransfer.files;

				if (fileArr.length == 0) {
					return;
				}

				onSelect(fileArr);
			}, false);
			// });

			//文件表单选择了文件事件
			// $(inputObj).bind('change', function(e) {
			inputObj.addEventListener('change', function(e) {
				var fileArr = this.files;

				if (fileArr.length == 0) {
					return;
				}
				onSelect(fileArr);
			}, false);
			// });
		}

		function onSelect(fileArr) {
			var fileObjArr = [],
				file,
				size,
				name,
				uploadKey;
			for (var i = 0, len = fileArr.length; i < len; i++) {
				file = fileArr[i];

				uploadKey = tvu.util.getGUID();
				size = file.fileSize || file.size;
				name = file.fileName || file.name;
				name = tvu.util.getFileName(name); //mac os上是绝对路径
				fileObjArr.push({
					uploadKey: uploadKey,
					name: name,
					size: size
				});
				keyToFileMap[uploadKey] = {
					file: file,
					xhr: null
				};
			}
			self.onSelect(fileObjArr);
		}

		function startUpload(fio) {
			var xhr = new XMLHttpRequest(),
				formData = new FormData(),
				file = keyToFileMap[fio.uploadKey].file,
				uploadKey = fio.uploadKey,
				paramKeys = selfConfig.upcgiParamKeys,
				param = $.extend({}, fio),
				timeoutTimer,
				tcgiUrl;

			param = tvu.util.getSubParam(param, paramKeys);

			$.extend(param, {
				uin: tvu.config.common.uin,
				g_tk: tvu.config.common.g_tk,
				Filename: fio.name,
				fsize: fio.size
			});

			for (var key in param) {
				if (param.hasOwnProperty(key)) {
					formData.append(key, param[key]);
				}
			}

			formData.append('Filedata', file);

			keyToFileMap[uploadKey].xhr = xhr;

			tcgiUrl = tvu.util.param({
				g_tk: tvu.config.common.g_tk
			}, selfConfig.upcgi);

			xhr.open('post', tcgiUrl, true);

			xhr.upload.addEventListener('progress', function(e) {
				if (e.lengthComputable) {
					self.onProgress({
						uploadKey: uploadKey,
						bytesProcessed: e.loaded,
						bytesTotal: e.total
					});
				}
			}, false);

			xhr.upload.addEventListener('load', function(e) {
				self.onSent({
					uploadKey: uploadKey
				});

				//文件发送完成，设置等待cgi返回的超时
				timeoutTimer = setTimeout(function() {
					xhr.abort();
					self.onCgiError({
						uploadKey: uploadKey,
						errorCode: 8003
					});
				}, tvu.config.common.timeout * 1000);
			}, false);

			xhr.upload.addEventListener('error', function(e) {
				self.onSendError({
					uploadKey: uploadKey,
					errorCode: 8001
				});
			}, false);

			xhr.addEventListener('load', function(e) {
				clearTimeout(timeoutTimer);
				var xmlDoc = xhr.responseXML,
					s = xmlDoc.getElementsByTagName('s'),
					codeEls,
					msgEls,
					errCode,
					errMsg;

				if (s.length > 0 && s[0].textContent == 'o') {
					keyToFileMap[uploadKey].xhr = null;
					xhr = null;

					self.onSuccess({
						uploadKey: uploadKey
					});
				} else {
					codeEls = xmlDoc.getElementsByTagName('em');
					errCode = codeEls && codeEls.length > 0 ? codeEls[0].textContent : 8002;

					msgEls = xmlDoc.getElementsByTagName('msg');
					errMsg = msgEls && msgEls.length > 0 ? msgEls[0].textContent : '';

					self.onCgiError({
						uploadKey: uploadKey,
						errorCode: errCode,
						errorMsg: errMsg
					});
				}

			}, false);

			xhr.addEventListener('error', function(e) {
				clearTimeout(timeoutTimer);
				//	txv.log("xhr onerror");
				// report({
				// 	step: 5,
				// 	errcode: xhr.status,
				// 	errtype: 1
				// });
				self.onCgiError({
					uploadKey: uploadKey,
					errorCode: (xhr.status || 8002)
				});
			}, false);

			xhr.send(formData);
		}

		function openSelectFileWindow() {
			inputObj.click();
		}

		/* 共有属性和方法 */

		this.inited = false;

		this.init = function() {
			if (!self.inited) {
				initObj();
				initEvent();
				self.inited = true;
				return !!inputObj;
			}
		};
		this.start = function(fio) {
			if (self.inited) {
				startUpload(fio);
			}
		};
		this.cancel = function(fio) {
			var xhr;
			if (self.inited) {
				xhr = keyToFileMap[fio.uploadKey].xhr
				if (xhr != null) {
					xhr.abort();
					xhr = null;
				}
			}
		};
		this.openSelectFileWindow = function() {
			if (self.inited) {
				openSelectFileWindow();
			}
		};

		this.onSelect = $.noop;
		this.onProgress = $.noop;
		this.onSent = $.noop;
		this.onSuccess = $.noop;
		this.onSendError = $.noop;
		this.onCgiError = $.noop;
	}
	return (new html5UploaderCore());
}());