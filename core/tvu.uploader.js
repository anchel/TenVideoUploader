tvu.uploader = (function() {
	var config = tvu.config,
		option = {
			uin: 0,
			encuin: '',
			g_tk: '',
			/**
			 * 上传业务ID
			 * @type {Number}
			 */
			businessID: '',
			/**
			 * 上传的业务类型
			 * @type {BusinessType}
			 */
			businessType: tvu.global.BusinessType.COMMON,
			/**
			 * 上传模式，FTN、FTN_HTML5、HTML5、FLASH，默认会自动按FTN、FTN_HTML5、HTML5、FLASH顺序依次降级进行选择，并设置
			 * @type {Number}
			 */
			uploadType: 0,
			/**
			 * 是否同时启用多模式上传，仅在自动设置上传模式时支持多模式
			 * @type {Boolean}
			 */
			useMultiUploadType: false,

			/**
			 * 最大并行上传数，启用队列时有效，默认为1个
			 * @type {Number}
			 */
			maxQueueParallelNum: 1,

			/**
			 * 选择文件对话框是否允许多选
			 * @type {Boolean}
			 */
			useMultiSelect: false,

			/**
			 * 选择文件按钮
			 * @type {Object}
			 */
			selectButton: null,

			/**
			 * 拖拽上传释放区域
			 * @type {Object}
			 */
			dropTarget: null,
            /**
             * 上传信息
             */
            uploadInfo : null,

			onDragEnterPage: $.noop,
			onDragLeavePage: $.noop,
			onDragEnterTarget: $.noop,
			onDragLeaveTarget: $.noop,
			onDropTarget: $.noop,

			onFileSelect: $.noop,
			onFileStart: $.noop,
			onFileScanProgress: $.noop,
			onFileUploadStart: $.noop,
			onFileUploadProgress: $.noop,
			onFileSuccess: $.noop,
			onFileError: $.noop,

			onQueueEmpty: $.noop,

			debug: false
		},
		inited = false;

	function initConfig(businessType) {
		//初始化不同业务的底层配置
		switch (businessType) {
			case tvu.global.BusinessType.BOKE:
				config.common.sort = 100;
				if (config.ftn) {
					config.ftn.autoRetry = true;
					config.ftn.tcgi = 'http://c.v.qq.com/fvupready';
				}
				if (config.ftnhtml5) {
                    config.ftnhtml5.autoRetry = true;
                    config.ftnhtml5.tcgi = 'http://c.v.qq.com/fvupready';
                }
				if (config.flash) {
					config.flash.tcgi = 'http://c.v.qq.com/vupready';
					config.flash.upcgi = 'http://uu.video.qq.com/v1/vupvideo';
				}
				break;
			case tvu.global.BusinessType.QZONE:
				config.common.sort = 200;
				if (config.ftn) {
					config.ftn.tcgi = 'http://c.v.qq.com/fqzupready';
				}
				if (config.flash) {
					config.flash.tcgi = 'http://c.v.qq.com/qzupready';
					config.flash.tcgiHttpMethod = 'post'; //
					config.flash.upcgi = 'http://uz.video.qq.com/v1/qzone/qzupvideo';
				}
				break;
            //第三方精品课上传
            case tvu.global.BusinessType.CLASS:
                config.common.sort = 204;
                if (config.ftn) {
                    config.ftn.tcgi = 'http://ke.qq.com/cgi-bin/manager/video/ftn_request';
                    //config.ftn.tcgiHttpMethod = 'get';
                }
//                if (config.flash) {
//                    config.flash.tcgi = 'http://c.v.qq.com/qzupready';
//                    config.flash.tcgiHttpMethod = 'post'; //
//                    config.flash.upcgi = 'http://uz.video.qq.com/v1/qzone/qzupvideo';
//                }
                break;
			case tvu.global.BusinessType.WEIBO:
				config.common.sort = 300;
				if (config.ftn) {
					config.ftn.tcgi = 'http://c.v.qq.com/ftupready';
					config.ftn.tcgiHttpMethod = 'get';
				}
				if (config.flash) {
					config.flash.tcgi = 'http://c.video.qq.com/cgi-bin/tupready';
					config.flash.upcgi = 'http://ut.video.qq.com/v1/tupvideo';
				}
				break;
			case tvu.global.BusinessType.WEIXIN: //微信公众号上传
                config.common.sort = 400;
                if (config.ftn) {  //微信公众号上传暂时不用FTN方式
                    config.ftn.tcgi = 'http://c.v.qq.com/openfvupready';
                    config.ftn.tcgiHttpMethod = 'get';
                }
                if (config.flash) {
                    if(location.protocol == 'https:'){
                        config.flash.tcgi = 'https://sec.video.qq.com/p/c.v/wxvupready';
                        config.flash.upcgi = 'https://sec.video.qq.com/p/uu.video/v1/wxvupvideo';
                        config.flash.src = 'https://imgcache.qq.com/tencentvideo_v1/tvu/swf/tvu.flashuploader.swf';
                    }else{
                        config.flash.tcgi = 'http://c.v.qq.com/wxvupready';
                        config.flash.upcgi = 'http://uu.video.qq.com/v1/wxvupvideo';
                        config.flash.src = 'http://imgcache.qq.com/tencentvideo_v1/tvu/swf/tvu.flashuploader.swf';
                    }
                    config.flash.tcgiHttpMethod = 'get'; //
                    config.flash.tcgiParamKeys = ['bid', 'appid', 'pluginsession'];
                    config.flash.upcgiParamKeys = ['bid', 'vid', 'fid', 'fsize', 'appid', 'pluginsession'];
                }
                if (config.html5) {
                    if(location.protocol == 'https:'){
                        config.html5.tcgi = 'https://sec.video.qq.com/p/c.v/wxvupready';
                        config.html5.upcgi = 'https://sec.video.qq.com/p/uu.video/v1/wxvupvideo';
                    }else{
                        config.html5.tcgi = 'http://c.v.qq.com/wxvupready';
                        config.html5.upcgi = 'http://uu.video.qq.com/v1/wxvupvideo';
                    }
                    config.html5.tcgiHttpMethod = 'get'; //
                    config.html5.tcgiParamKeys = ['bid', 'appid', 'pluginsession'];
                    config.html5.upcgiParamKeys = ['bid', 'vid', 'fid', 'fsize', 'appid', 'pluginsession'];
                }
                break;
			case tvu.global.BusinessType.COMMON:
			default:
				config.common.sort = 400;
				if (config.ftn) {
					config.ftn.tcgi = 'http://c.v.qq.com/openfvupready';
				}
				if (config.ftnhtml5) {
                    config.ftnhtml5.autoRetry = true;
                    config.ftnhtml5.tcgi = 'http://c.v.qq.com/openfvupready';
                }
				if (config.flash) {
					config.flash.tcgi = 'http://c.v.qq.com/openvupready';
					config.flash.tcgiHttpMethod = 'post'; //
					config.flash.upcgi = 'http://uu.video.qq.com/v1/openvupvideo';
				}
				break;
		}
	}

	function initOption(opt) {
		$.extend(option, opt);

		tvu.debug = !! option.debug;

		config.common.uin = option.uin;
		config.common.encuin = option.encuin;
		config.common.g_tk = option.g_tk;

		config.common.businessID = option.businessID;

		config.common.useMultiSelect = option.useMultiSelect;

        if(!!option.uploadInfo){
            $.extend(config.common.uploadInfo, option.uploadInfo);
        }

		//将不正确的上传模式，设为自动
		if (!tvu.global.getUploader(option.uploadType)) {
			option.uploadType = 0;
		}

		//队列并行上传数
		tvu.queue.maxParallelNum = option.maxQueueParallelNum;
		if (config.html5) {
			config.html5.dropTarget = option.dropTarget;
		}
	}

	function initEvent() {
		config.event.onSelect = onFileSelect;
		config.event.onStart = onFileStart;
		config.event.onScanProgress = onFileScanProgress;
		config.event.onUploadStart = onFileUploadStart;
		config.event.onUploadProgress = onFileUploadProgress;
		config.event.onSuccess = onFileSuccess;
		config.event.onError = onFileError;

		config.event.onDragEnterPage = option.onDragEnterPage;
		config.event.onDragLeavePage = option.onDragLeavePage;
		config.event.onDragEnterTarget = option.onDragEnterTarget;
		config.event.onDragLeaveTarget = option.onDragLeaveTarget;
		config.event.onDropTarget = option.onDropTarget;
	}

	function initUploaders() {
		var useMultiUploadType = option.useMultiUploadType,
			initOrderArr = [tvu.global.UploadType.FTN, tvu.global.UploadType.FTN_HTML5, tvu.global.UploadType.HTML5, tvu.global.UploadType.FLASH],
			tmpUploadType,
			tmpUploader;

		if (!option.uploadType) { //如果没指定上传模式，进行自动匹配，并设置第一个匹配模式为主要模式
			for (var i = 0, len = initOrderArr.length; i < len; i++) {
				tmpUploadType = initOrderArr[i];
				tmpUploader = tvu.global.getUploader(tmpUploadType);
				if (tmpUploader && tmpUploader.isSupport()) {
					if (!option.uploadType) { //设置第一个匹配的模式为主要模式
						option.uploadType = tmpUploadType;
					}
					tmpUploader.init();
					tvu.util.log(tvu.global.getUploaderName(tmpUploadType) + 'Uploader inited');
					if (!useMultiUploadType) { //不启用多模式则跳出 //TODO 多模式不用flash
						break;
					}
				}
			};
		} else { //如果指定则使用单一模式
			tmpUploader = tvu.global.getUploader(option.uploadType);
			if (tmpUploader && tmpUploader.isSupport()) {
				tmpUploader.init();
				tvu.util.log(tvu.global.getUploaderName(option.uploadType) + 'Uploader inited');
			} else {
				option.uploadType = 0;
			}
		}
	}

	function setSelectButton(button, uploadType) {
		var btn = $(button).eq(0),
			uploader = tvu.global.getUploader(uploadType);

		uploadType || (uploadType = option.uploadType);
		if (uploader && uploadType) {
			uploader.setSelectButton(btn);
		}
	}

	function onFileSelect(fioArr) {
		var fio;
		//先将所有选择好的文件信息都存起来
		for (var i = 0, len = fioArr.length; i < len; i++) {
			fio = fioArr[i];

			tvu.global.getUploader(fio.uploadType).checkFile(fio); //统一检测文件有效性

			if (fio.errorCode != 0) {
				fio.uploadStatus = tvu.global.UploadStatus.INVALID;
				fio.errorMsg = tvu.global.getErrorMsg(fio.errorCode) || fio.errorMsg;
			}

			tvu.global.addFio(fio);
			tvu.util.log('onFileSelect: ' + fio.uploadType + ', ' + fio.uid + ', ' + fio.name + ', ' + fio.size + ', ' + fio.errorCode + ', ' + tvu.global.getErrorMsg(fio.errorCode) || fio.errorMsg);
		}
		option.onFileSelect(fioArr);
	}

	function onFileStart(fio) {
		tvu.util.log('onFileStart: ' + fio.uploadType + ', ' + fio.uid + ', ' + fio.name);
		option.onFileStart(fio);
	}

	function onFileScanProgress(fio) {
		tvu.util.log('onFileScanProgress: ' + fio.uploadType + ', ' + fio.uid + ', [' + (fio.vid || 'no vid') + '], ' + fio.name + ' Process: step ' + fio.uploadStatus + ', ' + fio.percent + '%, PS: ' + fio.processedSize + ', TS: ' + fio.size + ', IS: ' + tvu.util.getSizeString(fio.instantSpeed) + '/s, AS: ' + tvu.util.getSizeString(fio.averageSpeed) + '/s');
		option.onFileScanProgress(fio);
	}

	function onFileUploadStart(fio) {
		tvu.util.log('onFileUploadStart: ' + fio.uploadType + ', ' + fio.uid + ', [' + fio.vid + '], ' + fio.name);
		option.onFileUploadStart(fio);
	}

	function onFileUploadProgress(fio) {
		tvu.util.log('onFileUploadProgress: ' + fio.uploadType + ', ' + fio.uid + ', [' + (fio.vid || 'no vid') + '], ' + fio.name + ' Process: step ' + fio.uploadStatus + ', ' + fio.percent + '%, PS: ' + fio.processedSize + ', TS: ' + fio.size + ', IS: ' + tvu.util.getSizeString(fio.instantSpeed) + '/s, AS: ' + tvu.util.getSizeString(fio.averageSpeed) + '/s');
		option.onFileUploadProgress(fio);
	}

	function onFileSuccess(fio) {
		tvu.util.log('onFileSuccess: ' + fio.uploadType + ', ' + fio.uid + ', [' + fio.vid + '], ' + fio.name);
		tvu.queue.remove(fio.uid);
		option.onFileSuccess(fio);

		continueQueue();
	}

	function onFileError(fio) {
		tvu.util.log('onFileError: ' + fio.uploadType + ', ' + fio.uid + ', [' + (fio.vid || 'no vid') + '], ' + fio.name + ' Error: ' + fio.errorCode + ', ' + tvu.global.getErrorMsg(fio.errorCode) || fio.errorMsg);
		fio.errorMsg = tvu.global.getErrorMsg(fio.errorCode) || fio.errorMsg;
		tvu.queue.remove(fio.uid);
		option.onFileError(fio);

		continueQueue();
	}

	function continueQueue() {
		if (tvu.queue.getTotalSize() == 0) { //都传完了，队列空了
			option.onQueueEmpty();
		} else {
			startQueue();
		}
	}

	function addToQueue(fio, addToFirst) {
		var rUid = '';
		if (fio && (fio instanceof tvu.FileInfo) && (
			fio.uploadStatus == tvu.global.UploadStatus.READY ||
			fio.uploadStatus == tvu.global.UploadStatus.FAIL ||
			fio.uploadStatus == tvu.global.UploadStatus.CANCEL)) {

			rUid = tvu.queue.add(fio.uid, addToFirst);
			if (rUid) { //队列添加成功
				tvu.FileInfo.reset(fio); //初始化状态
			}
		}
		return !!rUid;
	}

	function startQueue() {
		var uidArr = tvu.queue.start(),
			tmpUid,
			fio;

		for (var i = 0, len = uidArr.length; i < len; i++) {
			tmpUid = uidArr[i];
			fio = tvu.global.getFio(tmpUid);
			tvu.FileInfo.reset(fio); //初始化状态
			tvu.global.getUploader(fio.uploadType).start(fio);
		}
	}

	function start(fio) {
		var rUid = '';
		if (fio && (fio instanceof tvu.FileInfo) && (
			fio.uploadStatus == tvu.global.UploadStatus.READY ||
			fio.uploadStatus == tvu.global.UploadStatus.FAIL ||
			fio.uploadStatus == tvu.global.UploadStatus.CANCEL)) {

			rUid = tvu.queue.start(fio.uid);
			if (rUid) { //队列启动成功再调用组件开始上传
				tvu.FileInfo.reset(fio); //初始化状态
				tvu.global.getUploader(fio.uploadType).start(fio);
			}
		}
		return !!rUid;
	}

	function cancelQueue() {
		var uidArr = tvu.queue.cancel(),
			tmpUid,
			fio;
		for (var i = 0, len = uidArr.length; i < len; i++) {
			tmpUid = uidArr[i];
			fio = tvu.global.getFio(tmpUid);

			if (fio.uploadStatus != tvu.global.UploadStatus.READY) { //上传中的调用组件取消
				tvu.global.getUploader(fio.uploadType).cancel(fio);
			}

			fio.uploadStatus = tvu.global.UploadStatus.CANCEL;
		}

		continueQueue();
	}

	function cancel(fio) {
		var rUid = '';
		if (fio && (fio instanceof tvu.FileInfo) && (
			fio.uploadStatus == tvu.global.UploadStatus.READY ||
			fio.uploadStatus == tvu.global.UploadStatus.SCAN ||
			fio.uploadStatus == tvu.global.UploadStatus.UPLOAD)) {

			rUid = tvu.queue.cancel(fio.uid);
			if (rUid) { //队列取消成功再调用组件取消上传

				if (fio.uploadStatus != tvu.global.UploadStatus.READY) { //上传中的调用组件取消
					tvu.global.getUploader(fio.uploadType).cancel(fio);
				}
				fio.uploadStatus = tvu.global.UploadStatus.CANCEL;
			}
		}

		continueQueue();
		return !!rUid;
	}

	return {
		core: tvu,
		BusinessType: tvu.global.BusinessType,
		UploadType: tvu.global.UploadType,
		init: function(opt) {
			if (!inited) {
				!opt && (opt = {});
				initConfig(opt.businessType); //初始化业务统一配置
				initOption(opt); //初始化参数
				initEvent(); //初始化事件
				initUploaders(); //初始化上传核心
				setSelectButton(option.selectButton); //初始化选择文件按钮
				inited = true; //初始化完成
			}
			if (!option.uploadType) {
				tvu.util.log('no uploader inited');
			}
			return option.uploadType;
		},

		hasFtn: function() {
			var uploader = tvu.global.getUploader(tvu.global.UploadType.FTN);
			return (uploader && uploader.isSupport());
		},
		hasHtml5: function() {
			var uploader = tvu.global.getUploader(tvu.global.UploadType.HTML5);
			return (uploader && uploader.isSupport());
		},
		
		hasFtnHtml5: function() {
            var uploader = tvu.global.getUploader(tvu.global.UploadType.FTN_HTML5);
            return (uploader && uploader.isSupport());
        },

		// hasFlash: function() {
		// 	return tvu.flashUploader.isSupport();
		// },

		/**
		 * 通过指定文件路径直接选择文件，仅FTN模式支持
		 * @param  {String} path   文件在磁盘中的绝对路径
		 * @param  {String} [vid]  视频vid，续传时使用
		 */
		selectFile: function(path, vid) {
			var uploader = tvu.global.getUploader(tvu.global.UploadType.FTN);
			uploader && uploader.selectFile(path, vid);
		},
		/**
		 * 打开选择文件窗口，仅FTN、HTML5模式支持
		 * @param  {Number} [uploadType] 上传模式
		 */
		openSelectFileWindow: function(uploadType) {
			uploadType || (uploadType = option.uploadType);
			tvu.global.getUploader(uploadType).openSelectFileWindow();
		},
		/**
		 * 设置选择文件按钮
		 * @param {Object|String} button       按钮，可传入dom对象、jquery对象、选择器字符串
		 * @param {Number}        [uploadType] 上传模式，传入则设置对应方式的按钮，默认为所有方式使用同一个按钮
		 */
		setSelectButton: function(button, uploadType) {
			setSelectButton(button, uploadType);
		},

		addToQueue: function(fio, addToFirst) {
			return addToQueue(fio, addToFirst);
		},
		startQueue: function() {
			startQueue();
		},
		start: function(fio) {
			return start(fio);
		},
		cancelQueue: function() {
			cancelQueue();
		},
		cancel: function(fio) {
			return cancel(fio);
		},

		getQueueTotalSize: function() {
			return tvu.queue.getTotalSize();
		},
		getQueueUploadSize: function() {
			return tvu.queue.getUploadSize();
		},
		getQueueWaitSize: function() {
			return tvu.queue.getWaitSize();
		},

		getUploadType: function() {
			return option.uploadType;
		},
		getInstallFtnUrl: function(returnUrl) {
			return config.common.installFtnUrl + encodeURIComponent(returnUrl);
		},
		getSizeString: function(bytes) {
			return tvu.util.getSizeString(bytes);
		}
	};

}());