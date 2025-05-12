import type { Line } from './types'

const AVG_SOURCE =
  'https://raw.githubusercontent.com/akgcc/arkdata/main/assets/torappu/dynamicassets/avg/'

interface AddLine {
  add(args: Record<string, string>): Line
}
class AddBg implements AddLine {
  bgType: string = 'bg'
  constructor(bgType: string) {
    this.bgType = bgType
  }
  add(args: Record<string, string>): Line {
    const { image, imagegroup, xscale } = args
    const img = (image || imagegroup || '').toLowerCase()
    const urls: string[] = []
    if (this.bgType !== 'img' || img) {
      img
        .split('/')
        .forEach((v) =>
          urls.push(
            `${AVG_SOURCE}${this.bgType === 'img' ? 'image' : 'background'}s/${v || 'bg_black'}.png`
          )
        )
    }
    return {
      type: this.bgType,
      image: img,
      scale: xscale,
      urls
    }
  }
}
// grayscale colorinverse
class AddBgEffect implements AddLine {
  add(args: Record<string, string>): Line {
    const { effect = '', initamount = '', amount = '0' } = args
    return {
      type: 'bgeffect',
      effect: effect.toLowerCase(),
      initamount,
      amount
    }
  }
}
class AddBlocker implements AddLine {
  add(args: Record<string, string>): Line {
    const { a, r, g, b } = args
    return { type: 'blocker', a, r, g, b }
  }
}
class AddItem implements AddLine {
  hide: boolean = false
  constructor(hide: boolean) {
    this.hide = hide
  }
  add(args: Record<string, string>): Line {
    const { image } = args
    return image
      ? {
          type: 'item',
          image,
          urls: [`${AVG_SOURCE}items/${image}.png`],
          hide: this.hide
        }
      : { type: '' }
  }
}
class AddText implements AddLine {
  txtType: string = 'text'
  constructor(txtType: string) {
    this.txtType = txtType
  }

  add(args: Record<string, string>): Line {
    const { name, text } = args
    return text && text.trim()
      ? { type: this.txtType, speaker: name, text: text.replace(/\\n/g, '\n') }
      : { type: '' }
  }
}
class AddSticker implements AddLine {
  add(args: Record<string, string>): Line {
    const { text, alignment, size } = args
    return text && text.trim()
      ? {
          type: 'sticker',
          text: text.replace(/\\n/g, '\n'),
          align: alignment,
          size
        }
      : { type: '' }
  }
}
class AddLocation implements AddLine {
  add(args: Record<string, string>): Line {
    const { text } = args
    const where = text.match(/<p=1>(.*?)<\/>/)
    const when = text.match(/<p=2>(.*?)<\/>/)
    return {
      type: 'location',
      text: `${where![1]}${when ? `\n${when[1]}` : ''}`
    }
  }
}
class AddDecision implements AddLine {
  add(args: Record<string, string>): Line {
    const { options, values } = args
    const decisions = {}
    const _options = options.split(';')
    const _values = values.split(';')
    _values.forEach((v, k) => {
      decisions[v] = _options[k]
    })
    return {
      type: 'decision',
      options: decisions,
      choice: _values[0]
    }
  }
}
class AddPredicate implements AddLine {
  add(args: Record<string, string>): Line {
    const { references } = args
    return {
      type: 'predicate',
      refs: references
    }
  }
}

class Reader {
  adds: Record<string, AddLine> = {}
  useAdd(name: string, method: AddLine) {
    this.adds[name] = method
  }
  addLine(type: string, args: Record<string, string>) {
    if (!this.adds[type]) {
      return {
        res: false,
        data: { type: '' }
      }
    }
    const line: Line = this.adds[type].add.apply(this.adds[type], [args])
    return {
      res: line.type ? true : false,
      data: line
    }
  }
}

const reader = new Reader()
reader.useAdd('background', new AddBg('bg'))
reader.useAdd('largebg', new AddBg('bg'))
reader.useAdd('image', new AddBg('img'))
reader.useAdd('gridbg', new AddBg('grid'))
reader.useAdd('cameraeffect', new AddBgEffect())
reader.useAdd('blocker', new AddBlocker())
reader.useAdd('cgitem', new AddItem(false))
reader.useAdd('hidecgitem', new AddItem(true))
reader.useAdd('text', new AddText('text'))
reader.useAdd('multiline', new AddText('text'))
reader.useAdd('subtitle', new AddSticker())
reader.useAdd('sticker', new AddSticker())
reader.useAdd('animtext', new AddLocation())
reader.useAdd('decision', new AddDecision())
reader.useAdd('predicate', new AddPredicate())
export function addLine(
  type: string,
  args: Record<string, string>
): { res: boolean; data: Line } {
  return reader.addLine(type, args)
}
