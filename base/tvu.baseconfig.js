tvu.config = {
	event: {
		/**
		 * 文件选择完成，包括全部通过及未通过校验的文件
		 * @type {Function(Array[FileInfo] fioArr)}
		 */
		onSelect: $.noop,
		/**
		 * 文件全流程的开始，包括FTN的扫描
		 * @type {Function(FileInfo fio)}
		 */
		onStart: $.noop,
		/**
		 * vid申请完成，即将开始上传
		 * @type {Function(FileInfo fio)}
		 */
		onUploadStart: $.noop,
		/**
		 * 扫描进度
		 * @type {Function(FileInfo fio)}
		 */
		onScanProgress: $.noop,
		/**
		 * 上传进度
		 * @type {Function(FileInfo fio)}
		 */
		onUploadProgress: $.noop,
		/**
		 * 上传成功
		 * @type {Function(FileInfo fio)}
		 */
		onSuccess: $.noop,
		/**
		 * 出错回调
		 * @type {Function(FileInfo fio)}
		 */
		onError: $.noop,


		/**
		 * 拖拽文件进入页面
		 * @type {Function}
		 */
		onDragEnterPage: $.noop,
		/**
		 * 拖拽文件离开页面
		 * @type {Function}
		 */
		onDragLeavePage: $.noop,
		/**
		 * 拖拽文件进入接收区域
		 * @type {Function}
		 */
		onDragEnterTarget: $.noop,
		/**
		 * 拖拽文件离开接收区域
		 * @type {Function}
		 */
		onDragLeaveTarget: $.noop,
		/**
		 * 文件在接收区域释放
		 * @type {Function}
		 */
		onDropTarget: $.noop
	},
	/**
	 * 公共参数
	 */
	common: {
		/**
		 * QQ号
		 * @type {Number}
		 */
		uin: 0,
		/**
		 * 加密的QQ号字符串
		 * @type {String}
		 */
		encuin: '',
		/**
		 * g_tk
		 * @type {String}
		 */
		g_tk: '',
		/**
		 * 默认的视频类型
		 * @type {Number}
		 */
		businessID: '',
		/**
		 * 选择文件按钮
		 * @type {Object|String}
		 */
		selectButton: null,
		/**
		 * 选择文件对话框是否允许多选
		 * @type {Boolean}
		 */
		useMultiSelect: false,
		/**
		 * 文件名允许的最大长度
		 * @type {Number}
		 */
		maxFileNameLength: 255,
		/**
		 * 上传超时时间，单位秒
		 * @type {Number}
		 */
		timeout: 120,
		/**
		 * 统计上报url
		 * @type {String}
		 */
		reportCgi: 'http://rcgi.video.qq.com/report/upload',
		/**
		 * 统计上报url
		 * @type {String}
		 */
		installFtnUrl: 'http://mail.qq.com/cgi-bin/readtemplate?t=browser_addon&check=false&s=install&returnto=',
        //新版ftn下载链接
        //installFtnUrl: 'http://mail.qq.com/cgi-bin/readtemplate?t=browser_addon&check=false&s=install&returnto=',
        /**
		 * 允许上传的文件类型
		 * @type {String}
		 */
		fileType: '*.mp4;*.flv;*.f4v;*.webm;*.m4v;*.mov;*.3gp;*.3g2;*.rm;*.rmvb;*.wmv;*.avi;*.asf;*.mpg;*.mpeg;*.mpe;*.ts;*.div;*.dv;*.divx;*.vob;*.dat;*.mkv;*.swf;*.lavf;*.cpk;*.dirac;*.ram;*.qt;*.fli;*.flc;*.mod;*.mp3;*.aac;*.ac3;*.wav;*.m4a;*.ogg;*.wma;*.ape;',
		/**
		 * 业务分类，100-boke上传,200-Qzone视频上传,201-Qzone日志上传,202-说说上传,203-Q拍上传,204-精品课上传,300-weibo上传，400-通用上传，默认为400
		 * @type {Number}
		 */
		sort: 400,
        /**
         * 对外开放视频信息
         */
        uploadInfo: {
            bid: '',
            cid: '',
            title: '',
            tags: '',
            cat: '',
            desc: '',
            platform: '',
            appid : '',
            pluginsession : ''
        }
	}
};