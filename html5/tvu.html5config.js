tvu.config.html5 = {
	/**
	 * html5 id
	 */
	id: 'tvu_html5uploader_obj',
	/**
	 * 最大文件限制，单位M
	 */
	maxFileSize: 200,
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
	tcgiParamKeys: ['vid', 'bid', 'type', 'tags', 'cat', 'act', 'title', 'folder', 'orifname', 'size', 'uptype', 'key'],
	/**
	 * 申请上传cgi请求方式
	 * @type {String}
	 */
	tcgiHttpMethod: 'get',
	/**
	 * 上传cgi
	 * @type {String}
	 */
	upcgi: 'http://uu.video.qq.com/v1/vupvideo',
	/**
	 * 上传cgi参数列表
	 * @type {Array}
	 */
	upcgiParamKeys: ['fid', 'vid', 'bid', 'type', 'tags', 'cat', 'act', 'title', 'folder', 'fsize'],
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
	containerStyle: 'height:0;width:0;margin:0;padding:0;visibility:hidden;overflow:hidden;'
};