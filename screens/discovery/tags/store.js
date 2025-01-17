/*
 * @Author: czy0729
 * @Date: 2019-10-03 14:48:10
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-03 16:30:09
 */
import { observable, computed } from 'mobx'
import { discoveryStore } from '@stores'
import store from '@utils/store'
import { MODEL_SUBJECT_TYPE } from '@constants/model'

export const tabs = MODEL_SUBJECT_TYPE.data.map(item => ({
  title: item.title,
  key: item.label
}))
const namespace = 'ScreenTags'

export default class ScreenTags extends store {
  state = observable({
    page: 0,
    _loaded: false
  })

  init = async () => {
    const res = this.getStorage(undefined, namespace)
    const state = await res
    this.setState({
      ...state,
      _loaded: true
    })

    const { page } = this.state
    const { key } = tabs[page]
    const { _loaded } = this.list(key)
    if (!_loaded) {
      return this.fetchList(key, true)
    }
    return true
  }

  // -------------------- fetch --------------------
  fetchList = (type, refresh) => discoveryStore.fetchTags({ type }, refresh)

  // -------------------- get --------------------
  list(type) {
    return computed(() => discoveryStore.tags(type)).get()
  }

  // -------------------- page --------------------
  onChange = (item, page) => {
    if (page === this.state.page) {
      return
    }

    this.setState({
      page
    })
    this.setStorage(undefined, undefined, namespace)
    this.tabChangeCallback(page)
  }

  tabChangeCallback = page => {
    const { key } = tabs[page]
    const { _loaded } = this.list(key)

    if (!_loaded) {
      this.fetchList(key, true)
    }
  }
}
