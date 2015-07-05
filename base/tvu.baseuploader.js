tvu.baseUploader = (function() {

	function baseUploader() {}

	baseUploader.prototype = {
		getFio: function(uploadKey) {
			var self = this,
				uid = self.keyToUidMap[uploadKey],
				fio = tvu.global.getFio(uid);
			return fio;
		},
		setSelectButton: function(btn) {
			var self = this,
				offset,
				width,
				height,
				btnOverlay,
				btnOverlayEl,
				needTempShow;

			//没初始化的不执行
			if (!self.inited) {
				return;
			}

			//没传入按钮的不执行
			if (!btn || btn.length == 0) {
				btn = $(self.config.selectButton);
				if (btn.length == 0) {
					return;
				}
			}

			btnOverlayEl = self.getSelectButtonOverlay();

			if (btnOverlayEl) { //有按钮遮罩的

				btnOverlay = $(btnOverlayEl);

				//判断是否需要切换样式，display:none的不能获取到坐标
				needTempShow = (btn.css('display') == 'none');
				if (needTempShow) {
					btn.css({
						'visibility': 'hidden',
						'display': ''
					});
				}

				//获取坐标和宽高
				offset = btn.offset(),
				width = btn.outerWidth(),
				height = btn.outerHeight();

				//恢复样式
				if (needTempShow) {
					btn.css({
						'display': 'none',
						'visibility': ''
					});
				}

				//设置flash
				btnOverlay.css({
					left: offset.left + 'px',
					top: offset.top + 'px',
					width: width + 'px',
					height: height + 'px'
				}).attr({
					width: width,
					height: height
				});
			} else {
				$(self.config.selectButton).unbind('click'); //先取消旧按钮点击事件
				btn.bind('click', function() {
					self.openSelectFileWindow();
				});
			}
			self.config.selectButton = btn;
		},
		checkFile: function(fio) {
			var self = this,
				code = 0,
				extIndex,
				ext;

			//检查后缀名
			extIndex = fio.name.lastIndexOf('.');

			if (fio.errorCode == 1790) { //flash读文件大小异常，一般是超过4G限制
				code = 7003;
				fio.size = -1; //避免混淆设成负值
			} else if (fio.errorCode == 1791) { //flash只能上传一个文件，正在上传时不能选择

			} else if (fio.size == 0) { //文件大小为0
				code = 7004;
			} else if (fio.size >= self.config.maxFileSize * 1024 * 1024 || fio.size < 0) { //文件大小超限
				code = 7003;
			} else if (tvu.util.getRealLen(fio.name) > tvu.config.common.maxFileNameLength) { //文件名超长
				code = 7002;
			} else if (extIndex > 0) { //有后缀，检查类型
				ext = fio.name.substr(extIndex).toLowerCase(); //'.mp4'
				if (tvu.config.common.fileType.indexOf(ext + ';') == -1 || (ext == '.dat' && fio.size < 512000)) { //文件类型不支持
					code = 7000;
				}
			} else { //无后缀名
				code = 7001;
			}

			if (code != 0) { //有错误才赋值，有可能外部预先设置了错误码
				fio.errorCode = code;
			}
		},
		getVid: function(fio, callback, errorCallback) {
			var self = this,
				paramKeys = self.config.tcgiParamKeys,
				param = $.extend({}, fio),
				method = self.config.tcgiHttpMethod,
				url = tvu.util.param({
					g_tk: tvu.config.common.g_tk
				}, self.config.tcgi);

			param = tvu.util.getSubParam(param, paramKeys);

			$.extend(param, {
				uin: tvu.config.common.uin,
				encuin: tvu.config.common.encuin,
				g_tk: tvu.config.common.g_tk,
				otype: 'json'
			});

			tvu.util.ajax({
				url: url,
				// dataType: 'jsonp',
				type: method,
				// jsonCache: 0,
				data: param,
				// CSRF: true,
				success: function(json) {
					if (json && json.s == 'o') {
						callback(json);
					} else {
						json || (json = {
							em: 9002,
							msg: ''
						});
						errorCallback(json);
					}
				},
				error: function(e) {
					errorCallback({
						em: 9003,
						msg: ''
					});
				}
			});
		},
		/**
		 * 处理进度数据
		 * @param  {FileInfo}  fio          文件信息对象
		 * @param  {Object}    data         阶段数据
		 * @param  {Boolean}   useContinue  是否纠正续传，只有ftn的上传进度需要纠正
		 * @return {Number}                 本阶段时长，单位毫秒，最短0.01，返回0说明本次进度无效
		 */
		handleProgressData: function(fio, data, useContinue) {

            if(fio.lastTime==null || fio.startTime==null){
                return;
            }

            var newTime = $.now(),
				timespan = newTime - fio.lastTime,
				totalTimespan = newTime - fio.startTime,
				newProcessedSize = data.bytesProcessed,
				isRealFirst;

			//时间间隔为0，是当作0.01毫秒计算，避免速度无穷大
			(timespan == 0) && (timespan = 0.01);
			(totalTimespan == 0) && (totalTimespan = 0.01);

			(newProcessedSize > fio.size) && (newProcessedSize = fio.size);

			if (useContinue) {
				if (newProcessedSize == 262144) { //webkit续传时第一次起始文件大小不是从上次位置开始，目前发现是固定的262144，将这次进度反馈跳过
					return 0;
				}

				isRealFirst = (fio.startSize == 0);

				if (isRealFirst) {
					fio.startSize = newProcessedSize;
				}
			}

			// tvu.util.log('ftn progress data: ss: ' + fio.startSize + ', ps: ' + fio.processedSize + ', nps: ' + newProcessedSize + ', t: ' + timespan + ', tt: ' + totalTimespan);

			fio.instantSpeed = Math.round((newProcessedSize - ((useContinue && isRealFirst) ? fio.startSize : 0) - fio.processedSize) * 1000 / timespan); //瞬时速度Byte/S
			(fio.instantSpeed < 0) && (fio.instantSpeed = 0);
			fio.averageSpeed = Math.round((newProcessedSize - (useContinue ? fio.startSize : 0)) * 1000 / totalTimespan); //平均速度Byte/S
			(fio.averageSpeed < 0) && (fio.averageSpeed = 0);

			fio.percent = (newProcessedSize / fio.size * 100).toFixed(1);
			fio.processedSize = newProcessedSize;

			fio.lastTime = newTime;
			return timespan;
		},
		inited: false,
		config: {},
		keyToUidMap: {},
		init: $.noop,
		start: $.noop,
		cancel: $.noop,
		isSupport: function() {
			return false;
		},
		selectFile: $.noop,
		openSelectFileWindow: $.noop,
		getSelectButtonOverlay: $.noop
	};
	return baseUploader;
}());