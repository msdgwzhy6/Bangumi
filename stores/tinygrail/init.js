/*
 * @Author: czy0729
 * @Date: 2019-08-24 23:20:12
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-19 00:58:14
 */
import { LIST_EMPTY } from '@constants'

export const NAMESPACE = 'Tinygrail'

export const INIT_CHARACTERS_ITEM = {
  id: 0,
  bids: 0, // 买入
  asks: 0, // 卖出
  change: 0, // 成交量
  current: 0, // 当前价
  fluctuation: 0, // 涨跌幅
  total: 0, // 发行量
  marketValue: 0, // 市值
  users: 0, // ico人数
  name: '' // 人物中文名
}

export const INIT_RICH = {
  '1/50': LIST_EMPTY, // INIT_RICH_ITEM
  '2/50': LIST_EMPTY,
  '1/100': LIST_EMPTY
}

export const INIT_RICH_ITEM = {
  avatar: '',
  nickname: '',
  userId: 0,
  assets: 0, // 余额
  total: 0, // 总额
  principal: 0, // 总量
  lastActiveDate: 0, // 最后操作时间
  lastIndex: 0 // 上次排名
}

export const INIT_KLINE_ITEM = {
  id: 0,
  data: [
    // {
    //   time: 0,
    //   begin: 0,
    //   end: 0,
    //   low: 0,
    //   high: 0,
    //   amount: 0,
    //   price: 0
    // }
  ]
}

export const INIT_DEPTH_ITEM = {
  id: 0,
  asks: [],
  bids: []
}

export const INIT_ASSETS = {
  id: 0, // 当前用户Id
  balance: 0,
  _loaded: 0
}

export const INIT_CHARA_ASSETS = {
  id: 0,
  balance: 0,
  lastDate: '',
  characters: [],
  initials: []
}

export const INIT_CHARA_ASSETS_ITEM = {
  id: 0,
  icon: '',
  name: '',
  current: 0,
  state: 0,
  total: 0
}

export const INIT_USER_LOGS = {
  id: 0,
  amount: 0,
  balance: 0,
  askHistory: [], // INIT_USER_LOGS_ITEM
  asks: [],
  bidHistory: [],
  bids: [],
  _loaded: 0
}

export const INIT_USER_LOGS_ITEM = {
  id: 0,
  characterId: 0,
  amount: 0,
  price: 0,
  time: ''
}

export const INIT_MY_CHARA_ASSETS = {
  chara: LIST_EMPTY,
  ico: LIST_EMPTY,
  _loaded: 0
}

export const INIT_BALANCE_ITEM = {
  id: 0,
  balance: 0,
  change: 0,
  time: '',
  charaId: 0,
  desc: ''
}
