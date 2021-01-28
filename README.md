# node-license - 使用rsa非对称秘钥对生成license

## Node.js 生成rsa非对称秘钥对

1. 在Node.js v10.12.0引入了generateKeyPair方法, 用于生成公钥与私钥
2. 我看了generateKeyPair方法Node源码，c++层还是使用的openssl的函数库，所以只是扩展了在Node里面可以直接生成秘钥而已
3. 如果公钥丢失使用openssl rsa -in private.pem -pubout > public.pem 命令找回公钥，如果私钥丢失或者私钥的口令也忘记了，就彻底找不回信息了
4. Node.js 暂时没有提供根据私钥找回公钥的方法

## rsa非对称秘钥对

### 对称加密与非对称加密

1. 对称加密：加密和解密使用的是同一个密钥，加解密双方必须使用同一个密钥才能进行正常的沟通。
2. 非对称加密：需要两个密钥来进行加密和解密，公开密钥（public key，简称公钥）和私有密钥（private key，简称私钥） ，公钥加密的信息只有私钥才能解开，私钥加密的信息只有公钥才能解开。

需要注意的一点，这个公钥和私钥必须是一对的，如果用公钥对数据进行加密，那么只有使用对应的私钥才能解密，所以只要私钥不泄露，那么我们的数据就是安全的。

### 非对称加密中，究竟是公钥加密还是私钥加密

1. 对于加密：公钥加密，私钥加密。毕竟公钥可以公开，但是私钥只有你自已知道，你也同样希望只有你自已才能解密
2. 对于签名：私钥加密，公钥解密。好比你的签名只有你自已签的才是真的，别人签的都是假的。

## Install

```shell
# npm i license-node --save
```

## Usage

```js
const License = require('license-node');

const license = new License({
  subject: 'license',
  date: {
    unit: 'years', // days or weeks or months or years
    value: 1
  },
  description: '给产品授权一个一年有效期的license',
  licenseCheckModel: {
    macAddress: ['f0:18:98:32:4e:e5']
  }
});

// 可以不传文件路径， 结果直接返回私钥，公钥。
// 私钥和私钥口令记得保留，作为找回公钥的凭证，私钥丢失就彻底凉凉了
const {publicKey, privateKey} = license.createKeyPairFile('private_waveview', '', '');

// 根据私钥生成license签名
const sign = license.privateEncrypt(privateKey, 'private_waveview');

// 打包公钥和私钥生成的签名
const newLicenseObj = {
  publicKey,
  sign,
}
// 生成打包公钥和签名的base64编码， 用于给到项目部署
const newLicense = Buffer.from(JSON.stringify(newLicenseObj)).toString('base64');
// 转换成json
const result = JSON.parse(Buffer.from(newLicense, 'base64').toString());
// 使用公钥去解密签名
const info = license.publicDecrypt(result.publicKey, Buffer.from(result.sign, 'base64'), '',);

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
if (isMac(info.licenseCheckModel.macAddress, macList)) {
  console.log('可用继续使用产品哦');
  const remainAt = moment(info.expiryAt).diff(moment(), 'days');
  if (remainAt > 0) {
    console.log('剩余时间:', remainAt, '天');
  } else {
    console.log('产品已经到期了，如果想继续使用请联系管理员');
  }
} else {
  console.log('当前服务器的Mac地址没在授权范围内');
}
```

## 参考文章

[RSA非对称加密算法](https://www.jianshu.com/p/d56a72013392)

[Spring Boot项目中使用 TrueLicense 生成和验证License](https://www.zifangsky.cn/1277.html)

[在非对称加密中，是怎么做到知道公钥也没法破解密文的？](https://www.zhihu.com/question/312961692)

[密钥的生成](https://www.qdc.wiki/article/ComputerNetworking/Cryptography/rsa.html#%E5%AF%86%E9%92%A5%E7%9A%84%E7%94%9F%E6%88%90)
[RSA算法特点与应用注意事项](https://my.oschina.net/u/2371958/blog/1505927)
[使用rsa进行http传输加密](https://www.zybuluo.com/chy282/note/975080)
