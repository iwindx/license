'use strict';

const zlib = require('zlib');


const DATA = {
  subject: 'waveview',
  date: {
    unit: 'years', // days or weeks or months or years
    value: 1,
  },
  description: '给产品授权一个一年有效期的license',
  licenseCheckModel: {
    macAddress: [ 'f0:18:98:32:4e:e5' ],
  },
};
const data = Buffer.from(JSON.stringify(DATA), 'utf-8');

const deflateRaw = zlib.deflateRawSync(data);
const inflateRaw = zlib.inflateRawSync(deflateRaw);
console.log(data.length, deflateRaw.length, inflateRaw.length);

// 分隔大小加密
const slice1 = data.slice(0, 100);
const slice2 = data.slice(100, data.length);

console.log(slice1.length, slice2.length);

const buffer = Buffer.concat([ slice1, slice2 ]);
console.log(JSON.parse(buffer.toString('utf-8')));
