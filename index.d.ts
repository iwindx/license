
export interface IlicenseOptions {
  /** 主题 */
  subject: string;
  /** 时间 */
  date: string | {
    /** 天数 */
    value: number;
    /** moment 时间单位 days or weeks or months or years */
    unit: string;
  },
  /** 描述 */
  description?: string;
  /** 许可证验证 */
  licenseCheckModel: {
    /** mac地址 */
    macAddress: string[]
  }
}

export interface IlicenseData extends IlicenseOptions{
  /** 发布时间 */
  issuedAt: string;
  /** 过期时间 */
  expiryAt: string;
}

export interface IKeyPair {
  publicKey: string;
  privateKey: string;
}

export class License {
  /**
   *
   * 生成 rsa 非对称密钥对
   * @param {string} privatePassphrase 私钥口令
   * @param {string} [publicPassphrase] 公钥口令
   * @return {object} {publicKey, privateKey} 返回公钥、私钥
   */
  getKeyPair(privatePassphrase: string, publicPassphrase?: string, modulusLength?: number): IKeyPair;

  /**
   *
   * 生成 rsa 非对称密钥对文件到指定路径，名称分别为 private.pem 和 public.pem
   * @param {string} privatePassphrase 私钥口令
   * @param {string} [publicPassphrase] 公钥口令
   * @param {string} [filePath] 生成文件路径
   * @return {object | null} 返回公钥和私钥，值为null时直接返回filePath下文件
   */
  createKeyPairFile(privatePassphrase: string, publicPassphrase?: string, filePath?: string): void;

  /**
   *
   * 使用私钥加密数据
   * @param {IlicenseOptions} options 加密数据
   * @param {string} privateKey 私钥
   * @param {string} passphrase 私钥口令
   * @returns {string} 返回base64编码的签名
   */
  privateEncrypt(options: IlicenseOptions, privateKey: string, passphrase: string): string;

  /**
   *
   * 使用公钥解密数据
   * @param {string} publicKey 公钥
   * @param {Buffer} encryptBuffer 加密buffer
   * @param {string} [passphrase] 公钥口令
   * @returns {IlicenseData} 返回解密数据
   */
  publicDecrypt(publicKey: string, encryptBuffer: Buffer, passphrase?: string): IlicenseData;
}

export class ServerInfo {

  /**
   *
   * 获取服务器所有网卡的mac地址
   * @return {String[]} 网卡mac地址列表
   */
  getMacAddress(): Array<string>;
}
