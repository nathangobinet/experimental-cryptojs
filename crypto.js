var fs = require('fs');
const { Buffer } = require('buffer');
const aesjs = require('aes-js');

const DEFAULT_OPTIONS = {
  skip: 0,
  input: null,
  key: null,
  output: 'encrypt.bin',
  mode: 'RC4',
};

const CRYPTO_MODES = [
  'RC4', 'CBC', 'CTR', 'ECB'
]

// The initialization vector for CBC
const IV = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];

function concatArgsWithValues(args) {
  const argumentsWithValue = [];
  for(let i = 0; i < args.length; i+=2){
    argumentsWithValue.push({
      arg: args[i],
      value: args[i+1],
    });
  }
  return argumentsWithValue;
}

function handleParam(arg, value){
  switch(arg){
    case '-o': 
      return {output: value}; 
    case '-i': 
      return {input: value}; 
    case '-s': 
      return {skip: value}; 
    case '-k': 
      return {key: value};
    case '-c': 
      return {mode: value};
    default :
      return {error: `Unexpected argument: ${arg}`};
  }
}


function getParams(argv, options) {
  let newOptions = Object.assign({}, options);
  const args = argv.slice(2);
  if(args.includes('--help')) return { help: true };
  const argumentsWithValue = concatArgsWithValues(args);
  argumentsWithValue.forEach((argValue) => {
    newOptions = {...newOptions, ...handleParam(argValue.arg, argValue.value)};
  })
  return newOptions;
}


function help() {
  console.log('\nUsage: node crypto [-h] -i INFILE -o OUTFILE\n\nCrypt a file with RC4 or AES.\n\nDefault(RC4): node crypto -s 54 -k t3-key.bin -i penguin-rc4.bmp -o penguin.bmp\nor: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-rc4.bmp -c RC4\nCTR: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-rc4.bmp -c CTR\nCBC: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-cbc.bmp -c CBC\nECB: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-ecb.bmp -c ECB');
}

function checkParams(cryptoOptions, cryptoModes) {
  if(cryptoOptions.help) {
    help();
    return true;
  }

  if(cryptoOptions.mode === null) {
    console.log('Missing parameter -c (input)\nSee node crypto --help for more information');
    return true;
  }

  if(!cryptoModes.includes(cryptoOptions.mode)) { 
    console.log('Invalid parameter -c (mode)\nSee node crypto --help for more information');
    return true;
  }

  if(cryptoOptions.input === null) {
    console.log('Missing parameter -i (input)\nSee node crypto --help for more information');
    return true;
  }
  
  if(cryptoOptions.key  === null) {
    console.log('Missing parameter -k (key)\nSee node crypto --help for more information');
    return true;
  }

  return false;
}

function RC4_init(key) {
  const S = [];
  let j = 0;
  for(let i = 0; i <= 255; i++) S[i] = i;
  for(let i = 0; i <= 255; i++) {
    j = (j + S[i] + key[i % key.length]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
  }
  return S;
}

function RC4_crypt(S, input){
  let i = 0;
  let j = 0;
  return input.map((m) => {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
    const cryOct = S[(S[i] + S[j]) % 256];
    return cryOct ^ m;
  });
}

function RC4(key, inputSkipped) {
  const S = RC4_init(key);
  return RC4_crypt(S, inputSkipped);
}

async function getBufferFile(path) {
  const file = await fs.promises.readFile(path, {encoding: null});
  return [...file]; 
}

async function saveBufferFile(path, data) {
  const buffer = Buffer.from(data);
  await fs.promises.writeFile(path, buffer);
}

function crypt(key, inputSkipped, cryptoOptions) {
  switch(cryptoOptions.mode) {
    case 'RC4':
       return RC4(key, inputSkipped); 
    case 'CTR':
      return (new aesjs.ModeOfOperation.ctr(key)).encrypt(inputSkipped) ; 
    case 'CBC':
      return (new aesjs.ModeOfOperation.cbc(key, IV)).encrypt(inputSkipped) ; 
    case 'ECB':
      return (new aesjs.ModeOfOperation.ecb(key)).encrypt(inputSkipped) ; 
  }
}

(async function main() {
  const cryptoOptions = getParams(process.argv, DEFAULT_OPTIONS);
  if(checkParams(cryptoOptions, CRYPTO_MODES) === true) return;

  const input = await getBufferFile(cryptoOptions.input);
  const key = await getBufferFile(cryptoOptions.key);
  const inputSkipped = input.slice(cryptoOptions.skip);

  const cryptedPart = crypt(key, inputSkipped, cryptoOptions);

  const cryptedMessage = [...input.slice(0, cryptoOptions.skip) , ...cryptedPart];
  await saveBufferFile(cryptoOptions.output, cryptedMessage);
})();






