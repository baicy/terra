import { defineStore } from 'pinia'
import { getTEXT } from '@/utils/utils'
import type { Stage, Line, Scene } from '@/utils/types'
import { addLine } from '@/utils/reader'

export const useStoryStore = defineStore('story', () => {
  const DATA_SOURCE =
    'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/'
  const LANG = 'zh_CN'
  const dbSource = `${DATA_SOURCE}${LANG}`

  const story = reactive({
    title: '',
    lines: [] as Line[],
    scenes: [] as Scene[],
    hiddens: new Set() as Set<number>,
    resources: {}
  })
  async function loadStage(stage: Stage) {
    const { storyCode, storyName, avgTag, storyTxt } = stage
    story.title = `${storyCode} ${storyName} ${avgTag}`
    const txt: string = await getTEXT(
      `${dbSource}/gamedata/story/${storyTxt}.txt`
    )
    if (!txt) return story
    const lines = txt.matchAll(/^(\[[^\]]+])?(.*)?$/gim)
    format(lines)
  }
  function test() {
    format(testTxt.matchAll(/^(\[[^\]]+])?(.*)?$/gim))
  }
  let curChoice = ''
  let curRefs = ''
  function format(lines: RegExpStringIterator<RegExpExecArray>) {
    story.lines = []
    let id = 0
    for (const [, command = '', content = ''] of lines) {
      if (!command && !content) {
        continue
      }
      let cmd = ''
      let _args = ''
      const args: Record<string, string> = {}

      if (command) {
        ;[, cmd = '', _args] =
          /\[\s*?(?:([^=(\]]+)(?=[(\]])\(?)?([^\]]*?)\)?\s*?\]/.exec(command)!
        if (_args) {
          Array.from(
            _args.matchAll(/("?[^=", ]+"?)\s*=\s*"?((?<=")[^"]*|[^,]*)/gim)
          ).forEach((l) => (args[l[1].toLowerCase()] = l[2]))
        }
      }
      cmd = cmd.toLowerCase()
      if (!cmd || cmd === 'multiline') {
        cmd = 'text'
        args.text = content
      }
      if (cmd === 'animtext') {
        args.text = content
      }
      const { res, data } = addLine(cmd, args)
      if (res) {
        story.lines.push({ id, ...data })
        id++
      }
    }
    story.scenes = []
    story.hiddens = new Set()
    let bgEffect = { gray: 0, scale: '1' }
    let blocker = { a: '0', r: '0', g: '0', b: '0' }
    let item = ''
    let scene = {
      id: -1,
      bg: '',
      img: '',
      bgEffect,
      blocker,
      item,
      texts: [] as string[]
    } as Scene
    curChoice = ''
    curRefs = ''
    for (const i in story.lines) {
      const line = story.lines[i] as Line
      const {
        id = 0,
        type = '',
        image = '',
        urls = [],
        effect = 'grayscale',
        initamount = '',
        amount = '0',
        r = '0',
        g = '0',
        b = '0',
        a = '0',
        choice = '',
        refs = ''
      } = line
      if (type === 'bg') {
        bgEffect = { ...bgEffect, scale: line.scale || '1' }
        story.resources[image] = urls
        if (
          scene.id > -1 &&
          !scene.img &&
          !scene.texts.length &&
          (!scene.bg || Number(scene.blocker.a) === 1)
        ) {
          scene.id = id
          scene.bg = image
        } else {
          scene = addScene({
            id,
            bg: image,
            img: '',
            bgEffect,
            blocker,
            item,
            texts: []
          })
        }
      } else if (['img', 'grid'].includes(type)) {
        story.resources[image] = urls
        bgEffect = { ...bgEffect, scale: line.scale || '1' }
        if (scene.id > -1 && !scene.texts.length && !scene.img && image) {
          scene.id = id
          scene.img = image
          scene.blocker = blocker
          scene.bgEffect = bgEffect
        } else if (scene.img || image) {
          scene = addScene({
            id,
            bg: scene.bg,
            img: image,
            bgEffect,
            blocker,
            item,
            texts: []
          })
        }
      } else if (type === 'bgeffect') {
        if (effect === 'grayscale') {
          bgEffect = { ...bgEffect, gray: Number(amount) }
          if (!initamount) {
            scene.bgEffect = bgEffect
          }
        }
      } else if (type === 'blocker') {
        blocker = { a, r, g, b }
        if (story.scenes.length && !scene.texts.length && Number(a) !== 1) {
          scene.blocker = { a, r, g, b }
        }
      } else if (line.type === 'item') {
        story.resources[image] = urls
        if (line.hide) {
          item = ''
          if (!scene.img) {
            scene.item = ''
          }
        } else {
          item = image
          scene.item = item
        }
      } else if (['text', 'sticker'].includes(type)) {
        const { a: oa, r: or, g: og, b: ob } = scene.blocker
        const { a: na, r: nr, g: ng, b: nb } = blocker
        if (oa !== na || or !== nr || ob !== nb || og !== ng) {
          scene = addScene({
            id,
            bg: scene.bg,
            img: scene.img,
            bgEffect,
            blocker,
            item,
            texts: [line]
          })
        } else {
          if (!checkHidden(id)) {
            story.hiddens.delete(scene.id)
            scene.blocker = blocker
            scene.bgEffect = bgEffect
          }
          scene.texts.push(line)
        }
        line.sid = scene.id
      } else if (type === 'decision') {
        if (!checkHidden(id)) {
          story.hiddens.delete(scene.id)
          curChoice = choice
          scene.blocker = blocker
          scene.bgEffect = bgEffect
        }
        scene.texts.push(line)
        line.sid = scene.id
      } else if (type === 'predicate') {
        curRefs = refs
      }
    }
    // console.log(scene)
    // 最后一张是空场景，删除
    if (
      (['', 'bg_black'].includes(scene.bg) || scene.blocker.a === '1') &&
      !scene.img &&
      !scene.texts.length
    ) {
      story.scenes.pop()
    }
    function addScene(s: Scene) {
      story.scenes.push(s)
      checkHidden(s.id)
      return story.scenes[story.scenes.length - 1]
    }
  }
  function checkHidden(id: number) {
    if (curChoice && !curRefs.split(';').includes(curChoice)) {
      story.hiddens.add(id)
      return true
    }
    return false
  }
  function calHiddens(decision: Line) {
    curChoice = ''
    curRefs = ''
    const lid = decision.id!
    story.hiddens = new Set([...story.hiddens].filter((v) => v <= lid))
    curChoice = decision.choice!
    for (let i = lid + 1; i < story.lines.length; i++) {
      const line = story.lines[i] as Line
      if (line.type === 'predicate') {
        curRefs = line.refs!
      } else if (line.type === 'decision') {
        if (!checkHidden(i)) {
          story.hiddens.delete(line.sid!)
          curChoice = line.choice!
        }
      } else if (['bg', 'img', 'grid'].includes(line.type!)) {
        checkHidden(i)
      } else if (['text', 'sticker'].includes(line.type!)) {
        if (!checkHidden(i)) {
          story.hiddens.delete(line.sid!)
        }
      }
    }
  }

  return { story, loadStage, test, calHiddens }
})
