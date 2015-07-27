tvu.ftnhtml5Uploader = (function() {
	function ftnhtml5Uploader() {
		var self = this,
			config = tvu.config,
			selfConfig = config.ftnhtml5,
			uploadObj = null;
		
		var ns = tvu.ftnhtml5;	
		var uploadCoreObjMap = {};
		
		function log(msg){
		    
		}

		function initObj() {
			var html = '<div style="' + selfConfig.containerStyle + '"><input name="Filedata" type="file" id="' + selfConfig.id + '" style="' + selfConfig.style + '" width="' + selfConfig.width + '" height="' + selfConfig.height + '"' + (config.common.useMultiSelect ? ' multiple="multiple"' : '') + ' /></div>';
            $(document.body).append(html);

            inputObj = document.getElementById(selfConfig.id);
            return !!inputObj;
		}
		
		function initFio(file) {
            var fio;
            fio = new tvu.FileInfo(tvu.global.UploadType.FTN_HTML5, file.size, file.name, '', config.common.uploadInfo);
            fio.uploadKey = tvu.util.getGUID();
            return fio;
        }
		
		function createUploadCore(file){
            
            var fio = initFio(file);
            
            var uc = new ns.UploadCore(fio, file);
            uc.onStart = onStart;
            uc.onScanStart = onScanStart;
            uc.onScanProgress = onScanProgress;
            uc.onUploadStart = onUploadStart;
            uc.onUploadProgress = onUploadProgress;
            uc.onSuccess = onSuccess;
            uc.onCancel = onCancel;
            uc.onError = onError;
            
            uc.getVid = function(){
                var me = this;
                var fio = me.fio;
                self.getVid(fio, function(json) {
                    fio.exists = json.exists;
                    fio.checkkey = json.checkkey;
                    fio.vid = json.vid;
                    fio.fid = json.fid;
                    fio.serverip = json.serverip;
                    fio.serverport = json.serverport;
                    
                    //fio.serverip = '219.133.49.164';
    
                    //tvu.reporter.report(tvu.reporter.Step.BEFORE, fio);
    
                    //config.event.onUploadStart(fio);
    
                    me.emit('getvid');
                }, function(json) {
                    fio.errorCode = json.em;
                    fio.errorMsg = json.msg;
                    fio.errorType = tvu.reporter.ErrorType.CGI;
                    tvu.reporter.report(tvu.reporter.Step.BEFORE, fio);
    
                    onError(fio);
                });
            };
            
            uploadCoreObjMap[fio.uploadKey] = uc;
            return fio;
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
                inputObj.value = ''; //清空以便能重新出发 change 事件
            }, false);
            // });
        }
        
        function onSelect(fileArr) {
            var fioArr = [],
                file;
            for (var i = 0, len = fileArr.length; i < len; i++) {
                file = fileArr[i];

                var fio = createUploadCore(file);
                fioArr.push(fio);
            }
            config.event.onSelect(fioArr);
        }
        
        function onStart(fio){
            log('onStart ' + fio.name);
            config.event.onStart(fio);
        }
        
        function onScanStart(fio){
        //    log('onScanStart ' + fio.name);
        //    config.event.onScanStart(fio);
        }
        
        function onScanProgress(fio, extData){
            log('onScanProgress ' + fio.name + ' process:' + fio.processedSize);
            self.handleProgressData(fio, extData);
            config.event.onScanProgress(fio);
        }
        
        function onUploadStart(fio){
            log('onUploadStart ' + fio.name);
            config.event.onUploadStart(fio);
        }
        
        function onUploadProgress(fio, extData){
            log('onUploadProgress ' + fio.name);
            self.handleProgressData(fio, extData);
            config.event.onUploadProgress(fio);
        }
        
        function onSuccess(fio){
            log('onSuccess ' + fio.name);
            fio.uploadStatus = tvu.global.UploadStatus.SUCCESS;
            config.event.onSuccess(fio);
        }
        
        function onCancel(fio){
        //    log('onCancel ' + fio.name);
        //    config.event.onCancel(fio);
        }
        
        function onError(fio){
            log('onError ' + fio.name);
            fio.uploadStatus = tvu.global.UploadStatus.FAIL;
            config.event.onError(fio);
        }

		
		/* 共有属性和方法 */

		this.inited = false;

		this.config = selfConfig;

		this.init = function() {
			if (!self.inited) {
				if (!initObj()) { //初始化失败
					return;
				}
				initEvent();
				self.inited = true;
			}
		};
		this.start = function(fio) {
			var uploadKey = fio.uploadKey;
            var uc = uploadCoreObjMap[uploadKey];
            if(uc){
                uc.start();
            }
		};
		this.cancel = function(fio) {
			var uploadKey = fio.uploadKey;
            var uc = uploadCoreObjMap[uploadKey];
            if(uc){
                uc.cancel();
            }
		};
		
		this.isSupport = function() {
			return (window.File != undefined && window.FileReader != undefined && window.Worker != undefined && (new window.XMLHttpRequest).upload != undefined);
		};
		
		this.openSelectFileWindow = function() {
			openSelectFileWindow();
		};
		
		function openSelectFileWindow() {
            inputObj.click();
        }
	}
	tvu.util.extend(ftnhtml5Uploader, tvu.baseUploader);
	return (new ftnhtml5Uploader());
}());