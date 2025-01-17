/*
 * @Author: czy0729
 * @Date: 2019-09-10 20:49:40
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-15 12:59:45
 */
import { observable, computed } from 'mobx'
import { tinygrailStore } from '@stores'
import store from '@utils/store'
import { info } from '@utils/ui'

const defaultType = 'bid'

export default class ScreenTinygrailDeal extends store {
  state = observable({
    loading: false,
    type: defaultType, // 买卖类型
    value: 0, // 只能到一位小数
    amount: 0 // 只能是整数
  })

  prev = 0

  init = async () => {
    const { type = defaultType } = this.params
    this.setState({
      type
    })

    const res = this.refresh()
    await res
    this.initForm()

    return res
  }

  refresh = () =>
    Promise.all([
      tinygrailStore.fetchCharacters([this.monoId]),
      tinygrailStore.fetchDepth(this.monoId),
      tinygrailStore.fetchAssets(),
      tinygrailStore.fetchUserLogs(this.monoId)
    ])

  // -------------------- get --------------------
  @computed get monoId() {
    const { monoId = '' } = this.params
    return monoId.replace('character/', '')
  }

  @computed get chara() {
    return tinygrailStore.characters(this.monoId)
  }

  @computed get depth() {
    return tinygrailStore.depth(this.monoId)
  }

  @computed get assets() {
    return tinygrailStore.assets
  }

  @computed get userLogs() {
    return tinygrailStore.userLogs(this.monoId)
  }

  @computed get isBid() {
    const { type } = this.state
    return type === 'bid'
  }

  @computed get max() {
    const { value } = this.state
    const { balance } = this.assets
    const { amount } = this.userLogs
    if (this.isBid) {
      return value == 0 ? 0 : parseInt(balance / value)
    }
    return amount
  }

  // -------------------- action --------------------
  /**
   * 挂单
   */
  doSubmit = async () => {
    const { value, amount } = this.state
    if (!value || !amount) {
      info('出价有误')
      return
    }

    if (value * amount < 100) {
      info('交易额必须大于100')
      return
    }

    this.setState({
      loading: true
    })
    const result = await tinygrailStore[this.isBid ? 'doBid' : 'doAsk']({
      monoId: this.monoId,
      price: value,
      amount
    })

    if (!result) {
      info('交易失败')
      this.setState({
        loading: false
      })
      return
    }

    this.setState({
      amount: 0,
      loading: false
    })
    this.refresh()
  }

  /**
   * 取消挂单
   */
  doCancel = async (type, id) => {
    const result = await tinygrailStore[
      type === 'bid' ? 'doCancelBid' : 'doCancelAsk'
    ]({
      id
    })

    if (!result) {
      info('取消失败')
      return
    }

    this.refresh()
  }

  // -------------------- page --------------------
  /**
   * 初始化表单数据
   */
  initForm = () => {
    const { current } = this.chara
    if (current) {
      this.setState({
        value: this.moneyNatural(current)
      })
    }
  }

  /**
   * 切换买卖类型
   */
  toggleType = type => {
    const { current } = this.chara
    if (type === 'bid') {
      this.setState({
        type: 'bid',
        value: this.moneyNatural(current),
        amount: 0
      })
      return
    }

    this.setState({
      type: 'ask',
      value: this.moneyNatural(current),
      amount: 0
    })
  }

  /**
   * 金额格式过滤
   */
  moneyNatural = v => {
    if (v && !/^(([1-9]\d*)|0)(\.\d{0,1}?)?$/.test(v)) {
      if (v === '.') {
        return '0.'
      }

      if (!v) {
        return ''
      }

      return this.prev
    }

    this.prev = v
    return v
  }

  /**
   * 金额变动
   */
  changeValue = value => {
    const { type } = this.state
    const state = {
      value: this.moneyNatural(value)
    }
    if (type === 'bid') {
      state.amount = 0
    }

    this.setState(state)
  }

  /**
   * 减少
   */
  stepMinus = () => {
    const { value } = this.state
    let _value = parseFloat(this.moneyNatural(value)) - 1
    if (_value < 0) {
      _value = 0.1
    }

    this.setState({
      value: _value.toFixed(1)
    })
  }

  /**
   * 增加
   */
  stepPlus = () => {
    const { value } = this.state
    const _value = parseFloat(this.moneyNatural(value)) + 1

    this.setState({
      value: _value.toFixed(1)
    })
  }

  /**
   * 数量改变
   */
  changeAmount = amount => {
    let _amount = parseInt(amount)

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(_amount)) {
      _amount = 0
    }

    if (_amount > this.max) {
      _amount = this.max
    }

    this.setState({
      amount: _amount
    })
  }
}
