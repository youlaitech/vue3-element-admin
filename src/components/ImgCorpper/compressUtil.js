/**
 * 图片压缩类
 * @param minSize
 * @param maxSize
 * @constructor
 */
export function PhotoCompress(minSize, maxSize) {
  var nextQ = 0.5; // 压缩比例
  var maxQ = 1;
  var minQ = 0;

  /**
   * 将base64转换为文件
   * @param base64Codes base64编码
   * @param fileName 文件名称
   * @returns {*}
   */
  PhotoCompress.prototype.dataUrlToFile = function (base64Codes, fileName = new Date().getTime()) {
    var arr = base64Codes.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bStr = atob(arr[1]),
      n = bStr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bStr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  /**
   * 图片压缩
   * @param file 文件
   * @param callback 回调函数
   */
  PhotoCompress.prototype.compress = function (file, callback) {
    var self = this;
    self.imgBase64(file, function (image, canvas) {
      var base64Codes = canvas.toDataURL(file.type, nextQ); // y压缩
      var compressFile = self.dataUrlToFile(base64Codes, file.name.split(".")[0]); // 转成file文件
      var compressFileSize = compressFile.size; // 压缩后文件大小 k
      // console.log("图片质量：" + nextQ);
      // console.log("压缩后文件大小：" + compressFileSize / 1024);
      if (compressFileSize > maxSize) {
        // 压缩后文件大于最大值
        maxQ = nextQ;
        nextQ = (nextQ + minQ) / 2; // 质量降低
        self.compress(file, callback);
      } else if (compressFileSize < minSize) {
        // 压缩以后文件小于最小值
        minQ = nextQ;
        nextQ = (nextQ + maxQ) / 2; // 质量提高
        self.compress(file, callback);
      } else {
        callback(compressFile);
      }
    });
  };

  /**
   * 将图片转化为base64
   * @param file 文件
   * @param callback 回调函数
   */
  PhotoCompress.prototype.imgBase64 = function (file, callback) {
    // 看支持不支持FileReader
    if (!file || !window.FileReader) return;
    var image = new Image();
    // 绑定 load 事件处理器，加载完成后执行
    image.onload = function () {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = image.width * nextQ;
      canvas.height = image.height * nextQ;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      callback(image, canvas);
    };
    if (/^image/.test(file.type)) {
      // 创建一个reader
      var reader = new FileReader();
      // 将图片将转成 base64 格式
      reader.readAsDataURL(file);
      // 读取成功后的回调
      reader.onload = function () {
        // self.imgUrls.push(this.result);
        // 设置src属性，浏览器会自动加载。
        // 记住必须先绑定事件，才能设置src属性，否则会出同步问题。
        image.src = this.result;
      };
    }
  };
}
