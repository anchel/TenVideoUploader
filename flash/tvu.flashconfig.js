tvu.config.flash = {
	/**
	 * flash id
	 */
	id: 'tvu_flashuploader_obj',
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
	 * 申请上传cgi
	 * @type {String}
	 */
	tcgi: 'http://c.v.qq.com/openvupready',
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
	upcgi: 'http://uu.video.qq.com/v1/openvupvideo',
	/**
	 * 上传cgi参数列表
	 * @type {Array}
	 */
	upcgiParamKeys: ['fid', 'vid', 'bid', 'type', 'tags', 'cat', 'act', 'title', 'folder', 'fsize'],
	/**
	 * flash链接地址
	 * @type {String}
	 */
	src: 'http://qzs.qq.com/tencentvideo_v1/tvu/swf/tvu.flashuploader.swf',
	// src : 'http://qzs.qq.com/tencentvideo_v1/swf/video_upload_qzone.swf',
	/**
	 * flashplayer的版本号
	 * @type {String}
	 */
	version: '',
	/**
	 * 是否可见
	 */
	show: 0,
	/**
	 * 默认宽度
	 */
	width: '1',
	/**
	 * 默认高度
	 */
	height: '1',
	/**
	 * 默认样式
	 * @type {String}
	 */
	style: 'position:absolute;top:0;left:0;margin:0;padding:0;'
};