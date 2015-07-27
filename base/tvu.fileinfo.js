tvu.FileInfo = function(uploadtype, size, name, path, option) {
	/**
	 * 文件上传类型
	 * @type {UploadType}
	 * @public
	 */
	this.uploadType = uploadtype;
	/**
	 * 上传任务ID
	 * @type {String}
	 * @public
	 */
	this.uid = tvu.util.getGUID();
	/**
	 * 文件上传key，用于跟底层上传控件通信
	 * @type {String}
	 * @private
	 */
	this.uploadKey = '';
	/**
	 * 上传步骤，0未开始、1扫描中
	 * @type {Number}
	 * @public
	 */
	this.uploadStatus = tvu.global.UploadStatus.READY;

	/* 申请上传及上传参数 */

	/**
	 * 文件大小
	 * @type {Number}
	 * @public
	 */
	this.size = size;
	/**
	 * 文件名
	 * @type {String}
	 * @public
	 */
	this.name = name;
	/**
	 * 文件在磁盘中的绝对路径
	 * @type {String}
	 * @public
	 */
	this.path = path || '';

	/**
	 * 视频vid
	 * @type {String}
	 * @public
	 */
	this.vid = '';
	/**
	 * 服务器存储的文件ID
	 * @type {String}
	 * @private
	 */
	this.fid = '';

	/**
	 * 视频业务类型
	 * @type {Number}
	 * @private
	 */
	this.type = tvu.config.common.businessID;

	/**
	 * 存放目录
	 * @type {String}
	 * @public
	 */
	this.folder = '';
	/**
	 * 活动ID
	 * @type {Number}
	 * @public
	 */
	this.act = '';

	/**
	 * 文件上传类型，提交cgi用
	 * @type {Number}
	 * @private
	 */
	this.uptype = uploadtype;
	/**
	 * 文件大小，提交cgi用
	 * @type {Number}
	 * @private
	 */
	this.fsize = size;
	/**
	 * 文件名，提交cgi用
	 * @type {String}
	 * @private
	 */
	this.orifname = name;

	/* 视频信息参数 */

	/**
	 * 视频标题
	 * @type {String}
	 * @public
	 */
	//this.title = tvu.util.getFileName(name, true);
	this.title = !!option ? option.title : tvu.util.getFileName(name, true);
    /**
	 * 视频标签
	 * @type {String}
	 * @public
	 */
	this.tags = !!option ? option.tags : '';
	/**
	 * 视频描述
	 * @type {String}
	 * @public
	 */
	this.desc = !!option ? option.desc : '';
	/**
	 * 视频分类
	 * @type {String}
	 * @public
	 */
	this.cat = !!option ? option.cat : '';
    /**
     * 视频平台
     * @type {string}
     */
    this.platform = !!option ? option.platform : '';
    /**
     * 视频业务bid
     * @type {string}
     */
    this.bid = !!option ? option.bid : '';
    /**
     * 专辑ID
     * @type {string}
     */
    this.cid = !!option ? option.cid  : '';
    /**
     * 第三方CGI
     * @type {string}
     */
    this.cgi = !!option ? option.cgi  : '';
    
    /**
     * 微信公众号的appid
     */
    this.appid = !!option ? option.appid  : '';
    
    /**
     * 微信公众号的pluginsession
     */
    this.pluginsession = !!option ? option.pluginsession  : '';
    
	/**
	 * 视频版权，1原创、2转载
	 * @type {Number}
	 * @public
	 */
	// this.copyright = '';
	/**
	 * 分享到
	 * @type {String}
	 * @public
	 */
	// this.share = '';

	/* 微博上传用参数 */

	/**
	 * 微博key
	 * @type {String}
	 * @public
	 */
	this.key = '';
	/**
	 * 微博from
	 * @type {String}
	 * @public
	 */
	this.from = '';


	/* ftn 参数 */

	/**
	 * 自动重试次数，ftn内部会自动重试
	 * @type {Number}
	 * @private
	 */
	this.autoRetryNum = 0;
	/**
	 * 文件在磁盘中的绝对路径，申请上传用//TODO
	 * @type {String}
	 * @private
	 */
	// this.local = path;
	/**
	 * 文件是否已经在服务器中存在，可以续传，上报用
	 * @type {String}
	 * @private
	 */
	this.exists = '';
	/**
	 * 文件服务端校验key
	 * @type {String}
	 * @private
	 */
	this.checkkey = '';
	/**
	 * 文件上传服务器IP，上传用，上报用
	 * @type {String}
	 * @private
	 */
	this.serverip = '';
	/**
	 * 文件上传服务器端口，上传用
	 * @type {String}
	 * @private
	 */
	this.serverport = '';
	/**
	 * 文件SHA，上传用
	 * @type {String}
	 * @private
	 */
	this.sha = '';
	/**
	 * 文件SHA3，上传用
	 * @type {String}
	 * @private
	 */
	this.sha3 = '';
	/**
	 * 文件MD5，上传用
	 * @type {String}
	 * @private
	 */
	this.md5 = '';

	/**
	 * ftn控件的步骤，上报用
	 * @type {Number}
	 * @private
	 */
	this.fstep = 0;
	/**
	 * 已上传大小，上报用
	 * @type {Number}
	 * @private
	 */
	this.upsize = 0;
	/**
	 * 上传id，上报用
	 * @type {Number}
	 * @private
	 */
	this.upid = this.uid;


	/* 上传控制参数 */

	/**
	 * 扫描或上传百分比
	 * @type {Number}
	 * @public
	 */
	this.percent = 0;
	/**
	 * 扫描或上传平均速度
	 * @type {Number}
	 * @public
	 */
	this.averageSpeed = 0;
	/**
	 * 扫描或上传瞬时速度
	 * @type {Number}
	 * @public
	 */
	this.instantSpeed = 0;
	/**
	 * 扫描或上传已处理大小
	 * @type {Number}
	 * @public
	 */
	this.processedSize = 0;
	/**
	 * 上传开始时大小，续传时开始大小是上一次的大小，若直接用已处理大小来计算平均速度会有误差
	 * @type {Number}
	 * @private
	 */
	this.startSize = 0;
	/**
	 * 文件错误码
	 * @type {Number}
	 * @public
	 */
	this.errorCode = 0;
	/**
	 * 错误内容
	 * @type {String}
	 * @public
	 */
	this.errorMsg = '';
	/**
	 * 错误类型，上报用
	 * @type {Number}
	 * @private
	 */
	this.errorType = tvu.reporter.ErrorType.NO;


	/* 上报控制参数 */

	/**
	 * 上传中心跳上报timer
	 * @type {[type]}
	 * @private
	 */
	this.reportTimer = null;
	/**
	 * 是否是首次上传数据
	 * @type {Boolean}
	 * @private
	 */
	this.firstReport = false;
	/**
	 * 上传开始时间
	 * @type {Number}
	 * @private
	 */
	this.startTime = 0;
	/**
	 * 上一次进度反馈时间
	 * @type {Number}
	 * @private
	 */
	this.lastTime = 0;
	/**
	 * 上传停滞次数，超过10秒没有反馈进度算做停滞，每次停滞后又恢复时此计数+1
	 * @type {Number}
	 * @private
	 */
	this.stopNum = 0;
};
tvu.FileInfo.reset = function(fio) {
	if (fio && fio instanceof tvu.FileInfo && (fio.uploadStatus != tvu.global.UploadStatus.READY)) {
		fio.uploadStatus = tvu.global.UploadStatus.READY;

		fio.autoRetryNum = 0;

		fio.fstep = 0;
		fio.upsize = 0;
		fio.upid = tvu.util.getGUID();

		fio.percent = 0;
		fio.averageSpeed = 0;
		fio.instantSpeed = 0;
		fio.processedSize = 0;
		fio.startSize = 0;

		fio.errorCode = 0;
		fio.errorMsg = '';
		fio.errorType = tvu.reporter.ErrorType.NO;

		fio.reportTimer = null;
		fio.firstReport = false;
		fio.startTime = 0;
		fio.lastTime = 0;
		fio.stopNum = 0;
	}
}