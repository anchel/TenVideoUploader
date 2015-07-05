tvu.queue = {

	maxParallelNum: 1,

	uidWaitQueue: [],

	uidUploadQueue: [],

	/**
	 * 获取队列中上传中及等待上传文件的总数量
	 * @return {Number} 队列总数
	 */
	getUploadSize: function() {
		var self = this;
		return self.uidUploadQueue.length;
	},
	/**
	 * 获取队列中上传中及等待上传文件的总数量
	 * @return {Number} 队列总数
	 */
	getWaitSize: function() {
		var self = this;
		return self.uidWaitQueue.length;
	},
	/**
	 * 获取队列中上传中及等待上传文件的总数量
	 * @return {Number} 队列总数
	 */
	getTotalSize: function() {
		var self = this;
		return self.getUploadSize() + self.getWaitSize();
	},

	isUploading: function() {
		var self = this;
		return (self.uidUploadQueue.length > 0);
	},

	// isUploadQueueFull: function() {
	// 	return (self.uidUploadQueue.length == self.maxParallelNum);
	// },

	/**
	 * 向队列中添加文件
	 * @param  {String} uid     带待添加的文件uid
	 * @param  {Boolean} toFirst 是否添加到队列最前面
	 * @return {String}         添加成功返回文件对象失败返回null
	 */
	add: function(uid, toFirst) {
		var self = this,
			list,
			index;

		if (!uid) { //文件不存在则返回
			return '';
		}

		//检查是否已在队列
		list = self.uidWaitQueue;
		index = $.inArray(uid, list);
		if (index == -1) {
			list = self.uidUploadQueue;
			index = $.inArray(uid, list);
		}

		if (index != -1) { //如果队列中存在则返回
			return '';
		}

		if (toFirst) {
			self.uidWaitQueue.unshift(uid);
		} else {
			self.uidWaitQueue.push(uid);
		}
		return uid;
	},
	/**
	 * 从队列中删除文件
	 * @param  {String} uid 待删除的文件uid
	 * @return {String}     删除成功返回文件对象失败返回null
	 */
	remove: function(uid) {
		var self = this,
			list,
			index;

		if (!uid) { //文件不存在则返回
			return '';
		}

		list = self.uidWaitQueue;
		index = $.inArray(uid, list);
		if (index == -1) {
			list = self.uidUploadQueue;
			index = $.inArray(uid, list);
		}

		if (index == -1) { //如果队列中不存在则返回
			return '';
		}

		list.splice(index, 1);
		return uid;
	},
	/**
	 * 开始队列或指定文件
	 * @param  {String|true} [uid]     指定的上传文件信息，传入true则开始队列
	 * @return {String|String []}    如果传入了文件，开始成功返回文件对象，失败返回null；没传入文件，开始成功返回文件对象数组，失败返回空数组
	 */
	start: function(uid) {
		var self = this,
			uidArr = [],
			needNum,
			tmpUid,
			index;

		needNum = self.maxParallelNum - self.uidUploadQueue.length;

		if (uid == undefined) { //没指定文件，则为开始队列

			if (!needNum || self.uidWaitQueue.length == 0) { //上传队列已满或待传队列为空直接返回
				return uidArr;
			}

			while (needNum) {
				tmpUid = self.uidWaitQueue.shift();
				if (tmpUid) {
					uidArr.push(tmpUid);
					self.uidUploadQueue.push(tmpUid);
					needNum--;
				} else {
					break;
				}
			}
			return uidArr;
		} else { //开始指定文件

			if (!needNum) { //上传队列已满则返回
				return '';
			}

			index = $.inArray(uid, self.uidUploadQueue);
			if (index != -1) { //上传队列中已存在则返回
				return '';
			}

			self.remove(uid); //先从等待队列中移除
			self.uidUploadQueue.push(uid); //加入上传队列
			return uid;
		}
	},
	cancel: function(uid) {
		var self = this,
			uidArr = [],
			tmpArr,
			tmpUid;
		if (uid == undefined) { //没指定文件，则为开始队列
			tmpArr = self.uidUploadQueue.concat(self.uidWaitQueue);
			for (var i = 0, len = tmpArr.length; i < len; i++) {
				tmpUid = tmpArr[i];
				uidArr.push(tmpUid);
			};
			self.uidUploadQueue.length = 0;
			self.uidWaitQueue.length = 0;
			return uidArr;
		} else {
			if (self.remove(uid)) {
				return uid;
			} else {
				return '';
			}
		}
	}
};