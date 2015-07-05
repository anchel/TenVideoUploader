tvu.config.ftn = {
	/**
	 * ftn id
	 */
	id: 'tvu_ftnuploader_obj',
	/**
	 * 最大文件限制，单位M
	 */
	maxFileSize: (tvu.util.userAgent.ie ? 4096 : 4096),
	/**
	 * 选择文件按钮
	 * @type {Object|String}
	 */
	selectButton: null,
	/**
	 * 申请上传cgi
	 */
	tcgi: 'http://c.v.qq.com/openfvupready',
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
	 * 上传中文件分块大小
	 */
	blockSize: 256 * 1024,
	/**
	 *是否自动续传
	 */
	autoRetry: false,
	/**
	 * 自动续传的次数
	 */
	maxAutoRetryNum: 3,
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