# Experimental-cryptojs
RS4 and AES experimentation in javascript

Usage: `node crypto [--help] -i INFILE -k FILEKEY [-o] OUTFILE [-s] SKIPNUMBER [-c] MODE`

### Try it:

- Clone: `git clone https://github.com/nathangobinet/experimental-cryptojs.git`
- Install dependencies: `npm install`

### Available Mode:
- RC4
- CBC (AES)
- CTR (AES)
- ECB (AES)

### Exemples
- Default(RC4): node crypto -s 54 -k t3-key.bin -i penguin-rc4.bmp -o penguin.bmp
- or: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-rc4.bmp -c RC4
- CTR: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-rc4.bmp -c CTR
- CBC: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-cbc.bmp -c CBC
- ECB: node crypto -s 54 -k t3-key.bin -i penguin.bmp -o penguin-ecb.bmp -c ECB
