import dayjs from 'dayjs'

export type Sidestory = {
  id: string
  name: string
  first: number
  rerun: number
  trail: number
  reward: string
  large?: boolean
  linkage?: boolean
  drop?: string[]
}

export type ActiveSidestory = {
  id: string
  name: string
  re: boolean
  open: dayjs.Dayjs
  close: dayjs.Dayjs
  status: string
  reward: string
  drop: string[]
  type: string
}

export type Activity = {
  id: string
  name: string
  type: string
  color?: string[]
  startTime: number
  endTime: number
  rewardEndTime: number
  isReplicate: boolean
  reward?: unknown
}

export type ActiveActivity = {
  id: string
  name: string
  open: dayjs.Dayjs
  close: dayjs.Dayjs
  status: string
  reward: string
}

interface Pickup {
  rarity: number
  chars: string[]
}

export interface Pool {
  fake: boolean
  id: string
  name: string
  type: string
  start: string
  pickup: Pickup[]
  color: string[]
  status: '' | 'up' | 'shop'
  duration: number | string
}

export type PoolInfo = {
  id: string
  name: string
  type: string
  poolType: string
  re?: boolean
  status: 'active' | 'coming' | 'closed'
  open: dayjs.Dayjs
  close: dayjs.Dayjs
  pick6: string[]
  pick5: string[]
  pick4?: string
}

export interface Affair {
  fake: boolean
  id: string
  name: string
  start: string
  days?: number
  type: string
  rerun: boolean
  color: string[]
  pickup?: Pickup[]
  reward?: unknown
  drop?: string[]
}

export interface Character {
  id: string
  name: string
  color1: string
  color2: string
  nationId: string | null
  groupId: string | null
  teamId: string | null
  displayNumber: string
  appellation: string
  rarity: number
  profession: string
  subProfession: string
  sp: number
  passport: string
  type?: string
  source?: string
  onlineTime: string
  recruitTime: string
  classicTime: string
  comic: string
  skins: Skin[]
  pools: Pool[]
  cultivate: unknown
}

export interface Skin {
  id: string
  char: string
  name: string
  group: string
  tag: string
  online: string
}

export type Rogue = {
  id: string
  name: string
  start: number
  monthlyName: string
}

export type Material = {
  id: string
  name: string
  rarity: number
  type: string
  sortId: number
  description: string
  usage: string
}

// 剧情 story_review_table.json
export interface Storyline {
  id: 'main' | 'side' | 'mini'
  title: string
  eps: Record<string, Episode>
}
export interface EpisodeOrigin {
  id: string
  name: string
  actType: 'MAIN_STORY' | 'ACTIVITY_STORY' | 'MINI_STORY' | 'NONE'
  infoUnlockDatas: Stage[]
}
export interface Episode {
  id: string
  title: string
  type: 'main' | 'side' | 'mini'
  total: number
  stages: Stage[]
}
export interface Stage {
  storyId: string
  storyGroup: string
  storySort: number
  storyCode: string
  storyName: string
  avgTag: string
  storyInfo: string
  storyTxt: string
}

// Reader
interface ReaderLine {
  id: number
  type: string
  sid: number
  // image
  image: string
  urls: string[]
  scale: string
  hide: boolean
  // effect
  effect: string
  initamount: string
  amount: string
  //blocker
  a: string
  r: string
  g: string
  b: string
  // text
  text: string
  speaker: string
  // sticker
  align: string
  size: string
  // decision
  options: Record<string, string>
  choice: string
  // predicate
  refs: string
}
export type Line = Partial<ReaderLine>
export interface Scene {
  id: number
  bg: string
  img: string
  bgEffect: {
    gray: number
  }
  blocker: { a: string; r: string; g: string; b: string }
  item: string
  texts: Line[]
}
