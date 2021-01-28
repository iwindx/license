'use strict';

const os = require('os');

class ServerInfo {

  getServerInfo() {
    return {
      ip: this.getIpAddress(),
      macs: this.getMacAddress(),
    };
  }

  getIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  /**
   *
   * 获取服务器所有网卡的mac地址
   * @return {string[]} 网卡mac地址列表
   */
  getMacAddress() {
    const list = [];
    const network = os.networkInterfaces();
    const networkKey = Object.keys(network);
    const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;
    networkKey.map(key => {
      const value = network[key];
      value.map(item => {
        if (!zeroRegex.test(item.mac)) {
          list.push(item.mac);
        }
        return item;
      });
      return key;
    });
    return [ ...new Set(list) ];
  }
}

module.exports = ServerInfo;
