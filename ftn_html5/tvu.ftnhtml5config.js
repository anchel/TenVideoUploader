tvu.config.ftnhtml5 = {
    /**
     * ftn html5 id
     */
    id: 'tvu_ftnhtml5uploader_obj',
    /**
     * 最大文件限制，单位M
     */
    maxFileSize: 20480,
    /**
     * 选择文件按钮
     * @type {Object|String}
     */
    selectButton: null,
    /**
     * 拖拽上传释放区域
     * @type {Object|String}
     */
    dropTarget: null,
    /**
     * 申请上传cgi
     * @type {String}
     */
    tcgi: 'http://c.v.qq.com/vupready',
    /**
     * 申请上传cgi参数列表
     * @type {Array}
     */
    tcgiParamKeys: ['vid', 'type', 'tags', 'cid', 'bid', 'platform', 'cat', 'desc', 'act', 'title', 'folder', 'orifname', 'size', 'uptype', 'sha', 'sha3', 'md5', 'key'],
    /**
     * 申请上传cgi请求方式
     * @type {String}
     */
    tcgiHttpMethod: 'post',
    /**
     * 默认宽度
     */
    width: '0',
    /**
     * 默认高度
     */
    height: '0',
    /**
     * 默认样式
     * @type {String}
     */
    style: 'height:0;width:0;margin:0;padding:0;',
    /**
     * 容器默认样式
     * @type {String}
     */
    containerStyle: 'height:0;width:0;margin:0;padding:0;visibility:hidden;overflow:hidden;',
    /**
     * web worker 的URL路径
     * @type {String}
     */
    workerPath : 'http://qzs.qq.com/tencentvideo_v1/tvu/_debug_/ftnh5/tvu.uploader.worker.js'
    //workerPath : 'tvu.uploader.worker.js'
};