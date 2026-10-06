const fs = require("fs");

function wrapError(err) {
  if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
    const e = new Error("illegal operation on a directory, readlink");
    e.code = "EINVAL";
    e.errno = -4071;
    e.syscall = "readlink";
    return e;
  }
  return err;
}

if (fs && fs.readlinkSync) {
  const origReadlinkSync = fs.readlinkSync;
  fs.readlinkSync = function (path, options) {
    try {
      return origReadlinkSync.call(fs, path, options);
    } catch (err) {
      throw wrapError(err);
    }
  };
}

if (fs && fs.readlink) {
  const origReadlink = fs.readlink;
  fs.readlink = function (path, options, callback) {
    let cb = callback;
    let opt = options;
    if (typeof options === "function") {
      cb = options;
      opt = undefined;
    }
    return origReadlink.call(fs, path, opt, (err, linkString) => {
      if (cb) {
        cb(err ? wrapError(err) : null, linkString);
      }
    });
  };
}

if (fs && fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      throw wrapError(err);
    }
  };
}
