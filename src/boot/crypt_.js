import { sign, box, randomBytes } from 'tweetnacl'
import { base58 } from '@scure/base'

const crypt = {
  b2h(b) {
    return Array.prototype.map
      .call(b, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2)
      })
      .join('')
  },

  h2b(h) {
    if (typeof h !== 'string') throw new TypeError('expected string')
    let b = new Uint8Array(h.length / 2)
    let i = 0
    while (h.length >= 2) {
      b[i] = parseInt(h.substring(0, 2), 16)
      h = h.substring(2, h.length)
      i++
    }
    return b
  },

  u2b(s) {
    if (typeof s !== 'string') throw new TypeError('expected string')
    let i,
      d = unescape(encodeURIComponent(s)),
      b = new Uint8Array(d.length)
    for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i)
    return b
  },

  b2u(b) {
    let i,
      s = []
    for (i = 0; i < b.length; i++) s.push(String.fromCharCode(b[i]))
    return decodeURIComponent(escape(s.join('')))
  },

  async genKey() {
    return this.b2h(randomBytes(32))
  },

  async recKey(s) {
    let k = ''
    if (s.length > 64) {
      k = sign.keyPair.fromSecretKey(this.h2b(s)) // legacy
    } else {
      k = sign.keyPair.fromSeed(this.h2b(s))
    }
    const sec = k.secretKey // PRIVATE KEY
    const pub = k.publicKey // PUBLIC KEY
    return [this.b2h(sec), this.b2h(pub)]
  },

  //mes, sec
  sign(m, s) {
    // const encoder = new TextEncoder()
    // return base58.encode(sign(encoder.encode(m), s))
    return base58.encode(sign(m, s))
  },

  //mes, pub
  unsign(m, p) {
    let o = sign.open(this.h2b(m), this.h2b(p))

    if (o) {
      return this.b2u(o)
    } else {
      return false
    }
  },
  //my_box_pub, mes, rec_box_pub, my_box_sec
  encrypt(p, m, r, s) {
    const n = randomBytes(box.nonceLength)
    const encoder = new TextEncoder()
    const _m = encoder.encode(m)
    const _r = base58.decode(r)

    const e = box(_m, n, _r, s.slice(32, 64))

    return {
      snd: p,
      nonce: base58.encode(n),
      data: base58.encode(e)
    }
  },

  //mes, nonce, sender_box_pub, my_box_sec
  decrypt(m, n, s, r) {
    const decoder = new TextDecoder()
    const _m = base58.decode(m)
    const _n = base58.decode(n)
    const _s = base58.decode(s)

    const d = box.open(_m, _n, _s, r.slice(32, 64))
    console.log(d)

    return decoder.decode(d)
  }
}

export default crypt
