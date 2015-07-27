/**
 * 有些浏览器（在手机浏览器上发现）的Worker不支持File，所以需要在主线程通过File 的slice将数据分割好，塞给Worker里去计算
 * @param {Object} global
 * @param {Object} factory
 * 
 */

(function(global, factory){
    
    tvu.ftnhtml5 = tvu.ftnhtml5 || {};
    tvu.ftnhtml5.WorkerAdapter = factory(global);
    
})(window, function(){
    
    var ns = tvu.ftnhtml5;
    var Emitter = ns.Emitter;
    
    var CONST_DEF = ns.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var plog = function(){
        
    };
    
    function XHRWorker(url, ready, scope) {
        /* This loads the source of the worker through a XHR call. This is possible since the server
           from which we pull the worker source serves files with CORS (Access-Control-Allow-Origin: *).
           From the source (responseText) we build an inline worker.
           This works but we need to delegeate using the worker when the resource is loaded (XHR call finishes)
        */
        var oReq = new XMLHttpRequest();
        oReq.addEventListener('load', function() {
            var that = this;
            var worker = new Worker( window.URL.createObjectURL( new Blob([that.responseText], {type:'text/javascript'}) ) );
            if (ready) {
                ready.call(scope, worker);
            }
        }, false);
        oReq.addEventListener('error', function(e){
            if(ready){
                ready.call(scope, null);
            }
        }, false);
        oReq.open("get", url, true);
        oReq.send();
    }
    
    /**
     * 
     * @param {Object} options
     * {
     *     path : 'http://aa.bb.cc/dd.js'
     * }
     * 
     */
    function WorkerAdapter(options){
        Emitter.call(this);
        
        this.worker = null;
        
        options = options || {};
        
        this.options = options;
        
        this.inited = false;
        
        this.init();
    }
    
    tvu.util.extend(WorkerAdapter, Emitter);
    
    var prototype = {
        
        init : function(){
            var me = this;
            var options = me.options;
            var path = options.path;
            
            XHRWorker(path, function(w){
                if(!w){
                    me.emit('message', {
                        eventType : EventType.REPLY.UPLOAD_ERROR,  //错误
                        result : {
                            code : 1987,
                            msg : 'query worker content fail'
                        }
                    });
                    return;
                }
                
                var worker = me.worker = w;
            
                worker.addEventListener('message', function(e){
                    var data = e.data;
                    me._HandleMessage(data);
                }, false);
                
                me.inited = true;
                me.emit('init');
                
            }, me);
        },
        
        _HandleMessage : function(data){
            var me = this;
            var evType = data.eventType;
            var uniqueKey = data.uniqueKey;
            
            switch(evType){
                case EventType.REPLY.SCAN_START:
                    
                    //plog('scan start');
                    break;
                case EventType.REPLY.SCAN_ING:
                    var processed = data.result.processed;
                    
                    //plog('scan process');
                    break;
                case EventType.REPLY.SCAN_SUCCESS:
                
                    //plog('scan success ' + data.result.hash);
                    break;
                case EventType.REPLY.SCAN_CANCEL:
                
                    //plog('scan cancel');
                    break;
                case EventType.REPLY.UPLOAD_START:
                
                    //plog('upload start');
                    break;
                case EventType.REPLY.UPLOAD_ING:
                
                    //plog('upload process');
                    break;
                case EventType.REPLY.UPLOAD_SUCCESS:
                
                    //plog('upload success');
                    break;
                case EventType.REPLY.UPLOAD_CANCEL:
                    
                    //plog('upload cancel');
                    break;
                case EventType.REPLY.UPLOAD_ERROR:
                    
                    //plog('upload error');
                    break;
                default:
            }
            
            me.emit('message', data);  //告诉外面
        },
        
        postMessage : function(msg, callback){
            var me = this;
            
            if(me.inited){
                me.worker.postMessage(msg);
            }else{
                me.one('init', function(){
                    me.worker.postMessage(msg);
                });
            }
        },
        
        calFileMd5 : function(fileInfo, callback){
            /*
            fileInfo : {
                uniqueKey : 1,
                file : file,
                chunkSize : 2097152
            }*/
            var msg = {
                uniqueKey : fileInfo.uniqueKey,
                eventType : EventType.SEND.FILE_SCAN,
                algType : AlgType.MD5,
                fileInfo : fileInfo
            };
            this.postMessage(msg, callback);
        },
        
        calFileSha1 : function(fileInfo, callback){
            var msg = {
                uniqueKey : fileInfo.uniqueKey,
                eventType : EventType.SEND.FILE_SCAN,
                algType : AlgType.SHA1,
                fileInfo : fileInfo
            };
            this.postMessage(msg, callback);
        },
        
        calBufferMd5 : function(bufferInfo, callback){
            /*
             * bufferInfo : {
             *     uniqueKey : 0,
             *     buffer : arraybuffer
             * }
             */
            var msg = {
                uniqueKey : bufferInfo.uniqueKey,
                eventType : EventType.SEND.BUF_SCAN,
                algType : AlgType.MD5,
                bufferInfo : bufferInfo
            };
            this.postMessage(msg, callback);
        },
        
        /**
         * 取消扫描文件 
         */
        cancelCal : function(uniqueKey, algType, callback){
            var msg = {
                uniqueKey : uniqueKey,
                eventType : EventType.SEND.FILE_SCAN_CANCEL,
                algType : algType
            };
            this.postMessage(msg, callback);
        },
        
        /**
         * 上传文件 
         */
        uploadFile : function(fio, file){
            var msg = {
                uniqueKey : fio.uploadKey,
                eventType : EventType.SEND.FILE_UPLOAD,
                fileInfo : fio,
                file : file
            };
            this.postMessage(msg);
        },
        
        /**
         * 取消上传文件
         */
        cancelUpload : function(uniqueKey){
            var msg = {
                uniqueKey : uniqueKey,
                eventType : EventType.SEND.FILE_UPLOAD_CANCEL
            };
            this.postMessage(msg);
        },
        
        terminate : function(){
            if(this.worker){
                this.worker.terminate();
                this.worker = null;
            }
        }
    };
    
    for(var m in prototype){
        if(prototype.hasOwnProperty(m)){
            WorkerAdapter.prototype[m] = prototype[m];
        }
    }
    
    return WorkerAdapter;
});
