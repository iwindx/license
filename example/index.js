'use strict';

const moment = require('moment');
const fs = require('fs');
const path = require('path');
const License = require('../lib/license');
const ServerInfo = require('../lib/server_info');

const license = new License();

// 可以不传文件路径， 结果直接返回私钥，公钥
license.createKeyPairFile('private_waveview', '', __dirname);

const publicKey = fs.readFileSync(path.join(__dirname, 'public.pem')).toString();
const privateKey = fs.readFileSync(path.join(__dirname, 'private.pem')).toString();


// 根据私钥生成license签名
const sign = license.privateEncrypt({
  subject: 'ht',
  date: {
    unit: '3', // days or weeks or months or years
    value: 'months',
  },
  description: '给产品授权一个三个月有效期的license',
  licenseCheckModel: {
    macAddress: [ '80:18:44:e6:28:f4', '80:18:44:e6:d1:74' ],
  },
}, privateKey, 'private_waveview');

const newLicenseObj = {
  publicKey,
  sign,
};

const newLicense = Buffer.from(JSON.stringify(newLicenseObj)).toString('base64');
console.log(newLicense);
const result = JSON.parse(Buffer.from(newLicense, 'base64').toString());


const info = license.publicDecrypt(result.publicKey, Buffer.from(result.sign, 'base64'), '');
console.log(info);
const serverInfo = new ServerInfo();
console.log('serverInfo', serverInfo);
const macs = serverInfo.getMacAddress();
console.log(macs);
/**
 *
 * 判断mac地址满足
 * @param {String[]} macAddress 客户硬件mac地址
 * @param {String[]} macList 当前机器可用网卡的mac地址
 * @return {Boolean} 是否满足
 */
const isMac = (macAddress, macList) => {
  for (const mac of macAddress) {
    if (macList.includes(mac)) {
      return true;
    }
  }
  return false;
};

if (isMac(info.licenseCheckModel.macAddress, macs)) {
  console.log('可用继续使用产品哦');
  const remainAt = moment(info.expiryAt).diff(moment(), 'days');
  console.log(remainAt);
  if (remainAt > 0) {
    console.log('剩余时间:', remainAt, '天');
  } else {
    console.log('产品已经到期了，如果想继续使用请联系管理员');
  }
} else {
  console.log('当前服务器的Mac地址没在授权范围内');
}
