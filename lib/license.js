'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const crypto = require('crypto');
const moment = require('moment');

/**
 * License 加密解密生成方法
 */
class License {

  /**
   *
   * 生成 rsa 非对称密钥对
   * @param {string} privatePassphrase 私钥口令
   * @param {string} [publicPassphrase] 公钥口令
   * @param {number} [modulusLength] 秘钥位数
   * @return {publicKey, privateKey} 返回公钥、私钥
   */
  getKeyPair(privatePassphrase, publicPassphrase = '', modulusLength = 2048) {
    assert(privatePassphrase, 'privatePassphrase is required');
    return crypto.generateKeyPairSync('rsa', {
      modulusLength, // 模数的位数，即密钥的位数，2048 或以上一般是安全的，4096太耗计算性能一般是没有必要
      publicExponent: 0x10001, // 指数值，必须为奇数，默认值为 0x10001，即 65537
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
        passphrase: publicPassphrase,
      },
      privateKeyEncoding: {
        type: 'pkcs8', // 用于存储私钥信息的标准语法标准
        format: 'pem', // base64 编码的 DER 证书格式
        cipher: 'aes-256-cbc', // 加密算法和操作模式
        passphrase: privatePassphrase,
      },
    });
  }
  /**
   *
   * 生成 rsa 非对称密钥对文件到指定路径，名称分别为 private.pem 和 public.pem
   * @param {string} privatePassphrase 私钥口令
   * @param {string} [publicPassphrase] 公钥口令
   * @param {string} [filePath] 生成文件路径
   * @return {object | null} 返回公钥和私钥，值为null时直接返回filePath下文件
   */
  createKeyPairFile(privatePassphrase, publicPassphrase, filePath) {
    assert(privatePassphrase, 'privatePassphrase is required');
    const { publicKey, privateKey } = this.getKeyPair(privatePassphrase, publicPassphrase);
    if (!filePath) {
      return {
        publicKey,
        privateKey,
      };
    }
    try {
      fs.writeFileSync(path.join(filePath, 'private.pem'), privateKey, 'utf8');
      fs.writeFileSync(path.join(filePath, 'public.pem'), publicKey, 'utf8');
      return null;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *
   * 使用私钥加密数据
   * @param {object} [options] - options
   * @param {object} options.date - 开通时间类型
   * @param {string} [options.subject] - 主题
   * @param {string} [options.description] 证书描述
   * @param {object} options.licenseCheckModel - license硬件信息
   * @param {string} privateKey 私钥
   * @param {string} passphrase 私钥口令
   * @return {string} 返回base64编码的签名
   */
  privateEncrypt(options, privateKey, passphrase) {
    assert(options.date, 'options.date is required');
    assert(options.licenseCheckModel, 'options.licenseCheckModel is required');
    assert(privateKey, 'privateKey is required');
    assert(passphrase, 'privatePassphrase is required');
    const { date } = options;


    const data = {
      // 主题
      subject: options.subject || 'license-node',
      // 发布时间
      issuedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      // 过期时间
      expiryAt: typeof options.date === 'string' ? options.date : moment().add(date.value, date.unit).format('YYYY-MM-DD HH:mm:ss'),
      // 证书描述
      description: options.description || '',
      licenseCheckModel: options.licenseCheckModel,
    };

    const signature = crypto.privateEncrypt({
      key: privateKey,
      passphrase,
      padding: crypto.constants.RSA_PKCS1_PADDING, // 填充方式，需与解密一致
    }, Buffer.from(JSON.stringify(data), 'utf-8'));
    return signature.toString('base64');
  }

  /**
   *
   * 使用公钥解密数据
   * @param {string} publicKey 公钥
   * @param {Buffer} encryptBuffer 加密数据
   * @param {string} [passphrase] 公钥口令
   * @return {object} 返回解密数据
   */
  publicDecrypt(publicKey, encryptBuffer, passphrase) {
    assert(publicKey, 'publicKey is required');
    assert(encryptBuffer, 'encryptBuffer is required');
    const msgBuffer = crypto.publicDecrypt({
      key: publicKey,
      passphrase,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    }, encryptBuffer);

    return JSON.parse(msgBuffer.toString('utf8'));
  }
}

module.exports = License;
