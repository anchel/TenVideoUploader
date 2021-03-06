
(function(global, factory){
    
    tvu.ftnhtml5 = tvu.ftnhtml5 || {};
    tvu.ftnhtml5.UploadCore = factory();
    
})(window, function(){
    
    var config = tvu.config;
    var selfConfig = config.ftnhtml5;
    
    var ns = tvu.ftnhtml5;
    var Emitter = ns.Emitter;
    
    var WorkerAdapter = ns.WorkerAdapter;
    
    var CONST_DEF = ns.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var $ = window.jQuery;
    
    var methodArr = ['onStart', 'onScanStart', 'onScanProgress', 'onUploadStart', 'onUploadProgress', 'onSuccess', 'onCancel', 'onError',];
    var emptyFn = function(){};
    
    /**
     * 
     * @param {Object} fio
     * {
     *     
     * }
     * 
     */
    function UploadCore(fio, file){
        Emitter.call(this);
        
        this.fio = fio || {};
        this.file = file;
        
        for(var i=0,len=methodArr.length; i<len; i++){
            var m = methodArr[i];
            this[m] = emptyFn;
        }
        
        this._init();
    }
    
    tvu.util.extend(UploadCore, Emitter);
    
    var prototype = {
        
        _init : function(){
            var me = this;
            me.on('uploadevent', function(data){
                var evtName = data.name;
                var extData = data.extData;
                var param = me.fio;
                if(me[evtName]){
                    me[evtName](param, extData);
                }
            });
            
            /*
             * 每次计算完md5 或者 sha 都会触发该函数
             */
            me.on('algfinish', function(data){
                me._onAlgFinish(data);
            });
            
            me.on('getvid', function(data){
                var fio = me.fio;
                if(fio.uploadStatus == tvu.global.UploadStatus.UPLOAD){ 
                    return;
                }
                me.uploadFile();
            });
        },
        
        start : function(){
            var me = this;
            
            me.fio.uploadStatus = tvu.global.UploadStatus.READY;
            
            me.createWorkerAdapter();
            
            me.emit('uploadevent', {
                name : 'onStart'
            });
            
            me.scanFile();
        },
        
        cancel : function(){
            var fio = this.fio;
            if(fio.uploadStatus == tvu.global.UploadStatus.SCAN){  //scan
                this.cancelScan();
            }else if(fio.uploadStatus == tvu.global.UploadStatus.UPLOAD){ //upload
                this.cancelUpload();
            }
        },
        
        getVid : function(){
            
        },
        
        /*
         * 每次计算完md5 或者 sha 都会触发该函数
         */
        _onAlgFinish : function(data){
            var me = this;
            var fio = me.fio;
            var algType = data.algType;
            var hash = data.result.hash;
            if(algType == AlgType.SHA1){
                fio.sha = hash;
                me.waAlgSha.terminate();
                me.waAlgSha = null;
            }else{
                fio.md5 = hash;
                me.waAlgMd5.terminate();
                me.waAlgMd5 = null;
            }
            
            me._checkAlgHashReady();
        },
        
        _checkAlgHashReady : function(){
            var me = this;
            var fio = me.fio;
            //如果md5和sha1的值都计算完了，则进行下一步获取vid
            if(fio.sha && fio.md5){
                me.getVid();
            }
        },
        
        _handleMessage : function(data){
            var me = this;
            var fio = me.fio;
            var evType = data.eventType;
            var uniqueKey = data.uniqueKey;
            
            switch(evType){
                case EventType.REPLY.SCAN_START:
                    me.emit('uploadevent', {
                        name : 'onScanStart'
                    });
                    
                    break;
                case EventType.REPLY.SCAN_ING:
                    var algType = data.algType;
                    var processed = data.result.processed;
                    if(algType == AlgType.SHA1){
                        fio.processedSizeSha = processed;
                    }else{
                        fio.processedSizeMd5 = processed;
                    }
                    fio.processedSize = Math.min(fio.processedSizeSha, fio.processedSizeMd5);
                    fio.percent = (fio.processedSize / fio.size * 100).toFixed(2);
                    
                    me.emit('uploadevent', {
                        name : 'onScanProgress',
                        extData : {
                            bytesProcessed : fio.processedSize,
                            bytesTotal : fio.size
                        }
                    });
                    
                    break;
                case EventType.REPLY.SCAN_SUCCESS:
                    
                    me.emit('algfinish', data);
                    break;
                case EventType.REPLY.SCAN_CANCEL:
                    me.emit('uploadevent', {
                        name : 'onCancel'
                    });
                    
                    break;
                case EventType.REPLY.UPLOAD_START:
                
                    me.emit('uploadevent', {
                        name : 'onUploadStart'
                    });
                    break;
                case EventType.REPLY.UPLOAD_ING:
                
                    var processed = data.result.processed;
                    fio.processedSize = processed;
                    fio.percent = (fio.processedSize / fio.size * 100).toFixed(2);
                    
                    me.emit('uploadevent', {
                        name : 'onUploadProgress',
                        extData : {
                            bytesProcessed : fio.processedSize,
                            bytesTotal : fio.size
                        }
                    });
                    break;
                case EventType.REPLY.UPLOAD_SUCCESS:
                    me.emit('uploadevent', {
                        name : 'onSuccess'
                    });
                    //释放资源
                    me.waUpload.terminate();
                    me.waUpload = null;
                    break;
                case EventType.REPLY.UPLOAD_CANCEL:
                    me.emit('uploadevent', {
                        name : 'onCancel'
                    });
                    
                    break;
                case EventType.REPLY.UPLOAD_ERROR:
                    fio.errorCode = data.result.code;
                    fio.errorMsg = data.result.msg;
                    me.emit('uploadevent', {
                        name : 'onError'
                    });
                    
                    break;
                default:
            }
        },
        
        createWorkerAdapter : function(){
            var me = this;
            //计算md5值的worker
            if(!me.waAlgMd5){
                me.waAlgMd5 = new WorkerAdapter({
                    path : selfConfig.workerPath
                });
                me.waAlgMd5.on('message', function(data){
                    me._handleMessage(data);
                });
            }
            
            //计算sha值的worker
            if(!me.waAlgSha){
                me.waAlgSha = new WorkerAdapter({
                    path : selfConfig.workerPath
                });
                me.waAlgSha.on('message', function(data){
                    me._handleMessage(data);
                });
            }
            
            //上传文件的worker
            if(!me.waUpload){
                me.waUpload = new WorkerAdapter({
                    path : selfConfig.workerPath
                });
                me.waUpload.on('message', function(data){
                    me._handleMessage(data);
                });
            }
        },
        /**
         * 扫描文件 
         */
        scanFile : function(){
            var me = this;
            var fio = me.fio;
            fio.uploadStatus = tvu.global.UploadStatus.SCAN;
            
            if(!fio.md5){
                me.waAlgMd5.calFileMd5({
                    file : me.file,
                    uniqueKey : fio.uploadKey
                });
            }else{
                me._checkAlgHashReady();
            }
            
            if(!fio.sha){
                me.waAlgSha.calFileSha1({
                    file : me.file,
                    uniqueKey : fio.uploadKey
                });
            }else{
                me._checkAlgHashReady();
            }
        },
        
        /**
         * 取消扫描 
         */
        cancelScan : function(){
            var me = this;
            var fio = me.fio;
            var uniqueKey = fio.uploadKey;
            me.waAlgMd5.cancelCal(uniqueKey, AlgType.MD5);
            me.waAlgSha.cancelCal(uniqueKey, AlgType.SHA1);
        },
        
        /**
         * 上传文件 
         */
        uploadFile : function(){
            var me = this;
            var fio = me.fio;
            fio.uploadStatus = tvu.global.UploadStatus.UPLOAD;
            me.waUpload.uploadFile(fio, me.file);
        },
        
        /**
         * 取消上传 
         */
        cancelUpload : function(){
            var me = this;
            var fio = me.fio;
            var uniqueKey = fio.uploadKey;
            me.waUpload.cancelUpload(uniqueKey);
        }
    };
    
    for(var m in prototype){
        if(prototype.hasOwnProperty(m)){
            UploadCore.prototype[m] = prototype[m];
        }
    }
    
    return UploadCore;
});