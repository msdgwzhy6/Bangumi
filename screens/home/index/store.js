/* eslint-disable no-await-in-loop, no-restricted-syntax */
/*
 * @Author: czy0729
 * @Date: 2019-03-21 16:49:03
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-20 19:00:44
 */
import { observable, computed } from 'mobx'
import { userStore, subjectStore, collectionStore } from '@stores'
import { Eps } from '@screens/_'
import { IOS } from '@constants'
import { MODEL_SUBJECT_TYPE, MODEL_EP_STATUS } from '@constants/model'
import { sleep } from '@utils'
import { appNavigate } from '@utils/app'
import store from '@utils/store'

export const tabs = [
  {
    title: '全部'
  },
  {
    title: '动画'
  },
  {
    title: '书籍'
  },
  {
    title: '三次元'
  }
]
const namespace = 'ScreenHome'
const initItem = {
  expand: false,
  doing: false
}

export default class ScreenHome extends store {
  state = observable({
    _loaded: false, // 本地数据读取完成

    /**
     * base
     */
    visible: false, // <Modal>可见性
    subjectId: 0, // <Modal>当前条目Id
    page: 0, // <Tabs>当前页数
    _page: 0, // header上的假<Tabs>当前页数
    top: [], // <Item>置顶记录
    item: {
      // [subjectId]: initItem // 每个<Item>的状态
    },

    /**
     * layout
     */
    grid: IOS, // 是否格子布局, iOS默认使用格子
    current: 0
  })

  init = async () => {
    // userStore.logTourist()

    let res
    if (this.isLogin) {
      res = this.getStorage(undefined, namespace)
      const state = await res
      this.setState({
        ...state,
        _loaded: true
      })
      this.initFetch()
    }
    return res
  }

  initFetch = async refresh => {
    const res = Promise.all([
      userStore.fetchUserCollection(),
      userStore.fetchUserProgress()
    ])
    const data = await res

    if (data[0]) {
      // @issue 由于Bangumi没提供一次性查询多个章节信息的API, 暂时每项都发一次请求
      const list = this.sortList(data[0])
      for (const item of list) {
        const { subject_id: subjectId } = item
        const { _loaded } = this.subjectEp(subjectId)

        // 被动请求
        if (refresh || !_loaded) {
          await subjectStore.fetchSubjectEp(subjectId)
          await sleep(400)
        }
      }
    }
    return res
  }

  // -------------------- get --------------------
  /**
   * <Item />
   */
  $Item(subjectId) {
    return computed(() => this.state.item[subjectId] || initItem).get()
  }

  /**
   * 用户是否登陆
   */
  @computed get isLogin() {
    return userStore.isLogin
  }

  /**
   * 用户信息
   */
  @computed get userInfo() {
    return userStore.userInfo
  }

  /**
   * 用户收藏
   */
  @computed get userCollection() {
    return userStore.userCollection
  }

  /**
   * 用户条目收视进度
   */
  userProgress(subjectId) {
    return computed(() => userStore.userProgress(subjectId)).get()
  }

  /**
   * 条目信息
   */
  subject(subjectId) {
    return computed(() => {
      const { subject } =
        this.userCollection.list.find(item => item.subject_id === subjectId) ||
        {}
      return subject || {}
    }).get()
  }

  /**
   * 条目章节
   */
  subjectEp(subjectId) {
    return computed(() => subjectStore.subjectEp(subjectId)).get()
  }

  /**
   * 条目章节数据
   */
  eps(subjectId) {
    return computed(() => {
      const eps = subjectStore.subjectEp(subjectId).eps || []
      const { length } = eps

      // 集数超过了1页的显示个数
      if (length > Eps.pageLimit) {
        const userProgress = this.userProgress(subjectId)
        const index = eps.findIndex(
          item => item.type === 0 && userProgress[item.id] !== '看过'
        )

        // 找不到未看集数, 返回最后的数据
        if (index === -1) {
          return eps.slice(length - Eps.pageLimit - 1, length - 1)
        }

        // 找到第1个未看过的集数, 返回1个看过的集数和剩余的集数
        // @notice 注意这里第一个值不能小于0, 不然会返回空
        return eps.slice(index < 1 ? 0 : index - 1, index + Eps.pageLimit - 1)
      }
      return eps
    }).get()
  }

  /**
   * 条目下一个未看章节
   */
  nextWatchEp(subjectId) {
    return computed(() => {
      const eps = this.eps(subjectId)
      const userProgress = this.userProgress(subjectId)
      const index = eps.findIndex(
        item => item.type === 0 && userProgress[item.id] !== '看过'
      )
      if (index === -1) {
        return {}
      }
      return eps[index]
    }).get()
  }

  /**
   * 章节是否放送中
   */
  isToday(subjectId) {
    return computed(() => {
      const eps = this.eps(subjectId)
      return eps.findIndex(item => item.status === 'Today') !== -1
    }).get()
  }

  /**
   * 条目观看进度百分比
   */
  percent(subjectId, subject = {}) {
    return computed(() => {
      const eps = this.eps(subjectId)
      if (!subject.eps_count || !eps.length) {
        return 0
      }

      // 排除SP章节
      let watchedCount = 0
      const userProgress = this.userProgress(subjectId)
      try {
        eps
          .filter(item => item.type === 0)
          .forEach(item => {
            if (userProgress[item.id] === '看过') {
              if (watchedCount === 0) {
                watchedCount += parseInt(item.sort)
              } else {
                watchedCount += 1
              }
            }
          })
      } catch (error) {
        // do nothing
      }
      return (watchedCount / subject.eps_count) * 100
    }).get()
  }

  // -------------------- page --------------------
  /**
   * @issue onTabClick与onChange在用受控模式的时候, 有冲突
   * 暂时这样解决
   */
  onTabClick = (item, page) => {
    if (page === this.state.page) {
      return
    }

    this.setState({
      page
    })

    // @issue onTabClick与onChange在用受控模式的时候有冲突, 暂时这样解决
    setTimeout(() => {
      this.setState({
        _page: page
      })
      this.setStorage(undefined, undefined, namespace)
    }, 400)
  }

  onChange = (item, page) => {
    if (page === this.state.page) {
      return
    }

    this.setState({
      page,
      _page: page
    })
    this.setStorage(undefined, undefined, namespace)
  }

  /**
   * 列表排序
   */
  sortList = (list = []) => {
    // 置顶排序
    const { top } = this.state
    const topMap = {}
    top.forEach((subjectId, order) => (topMap[subjectId] = order + 1))

    return (
      list
        // 上映日期
        // .sort(
        //   (a, b) =>
        //     String(b.subject.air_date).replace(/-/g, '') -
        //     String(a.subject.air_date).replace(/-/g, '')
        // )
        // 放送中
        .sort((a, b) => this.isToday(b.subject_id) - this.isToday(a.subject_id))
        // 置顶, 数组位置越大排越前
        .sort(
          (a, b) => (topMap[b.subject_id] || 0) - (topMap[a.subject_id] || 0)
        )
    )
  }

  /**
   * 显示收藏管理<Modal>
   */
  showManageModal = subjectId => {
    this.setState({
      visible: true,
      subjectId
    })
  }

  /**
   * 隐藏收藏管理<Modal>
   */
  closeManageModal = () => {
    this.setState({
      visible: false
    })
  }

  /**
   * <Item>展开和收起
   */
  itemToggleExpand = subjectId => {
    const state = this.$Item(subjectId)
    this.setState({
      item: {
        [subjectId]: {
          ...state,
          expand: !state.expand
        }
      }
    })
    this.setStorage(undefined, undefined, namespace)
  }

  /**
   * <Item>置顶和取消置顶
   */
  itemToggleTop = (subjectId, isTop) => {
    const { top } = this.state
    const _top = [...top]
    const index = _top.indexOf(subjectId)
    if (index === -1) {
      _top.push(subjectId)
    } else {
      _top.splice(index, 1)

      // 再置顶
      if (isTop) {
        _top.push(subjectId)
      }
    }
    this.setState({
      top: _top
    })
    this.setStorage(undefined, undefined, namespace)
  }

  /**
   * 全部展开 (书籍不要展开, 展开就收不回去了)
   */
  expandAll = () => {
    const item = {}
    this.userCollection.list.forEach(({ subject_id: subjectId, subject }) => {
      const type = MODEL_SUBJECT_TYPE.getTitle(subject.type)
      if (type !== '书籍') {
        item[subjectId] = {
          expand: true,
          doing: false
        }
      }
    })
    this.setState({
      item
    })
    this.setStorage(undefined, undefined, namespace)
  }

  /**
   * 全部关闭
   */
  closeAll = () => {
    this.clearState('item')
    this.setStorage(undefined, undefined, namespace)
  }

  /**
   * 选择布局
   */
  selectLayout = title => {
    this.setState({
      grid: title === '方格布局'
    })
    this.setStorage(undefined, undefined, namespace)
  }

  /**
   * 格子布局条目选择
   */
  selectGirdSubject = subjectId => {
    this.setState({
      current: subjectId
    })
    this.setStorage(undefined, undefined, namespace)
  }

  // -------------------- action --------------------
  /**
   * 观看下一集
   */
  doWatchedNextEp = async subjectId => {
    const state = this.$Item(subjectId)
    if (state.doing) {
      return
    }
    this.setState({
      item: {
        [subjectId]: {
          ...state,
          doing: true
        }
      }
    })

    const { id } = this.nextWatchEp(subjectId)
    await userStore.doUpdateEpStatus({
      id,
      status: MODEL_EP_STATUS.getValue('看过')
    })
    userStore.fetchUserCollection()
    userStore.fetchUserProgress()

    this.setState({
      item: {
        [subjectId]: {
          ...state,
          doing: false
        }
      }
    })
  }

  /**
   * 更新书籍下一个章节
   */
  doUpdateNext = async (subjectId, epStatus, volStatus) => {
    await collectionStore.doUpdateBookEp({
      subjectId,
      chap: epStatus,
      vol: volStatus
    })
    userStore.fetchUserCollection()
    userStore.fetchUserProgress()
  }

  /**
   * 管理收藏
   */
  doUpdateCollection = async values => {
    await collectionStore.doUpdateCollection(values)
    this.closeManageModal()
  }

  /**
   * 章节菜单操作
   */
  doEpsSelect = async (value, item, subjectId, navigation) => {
    const status = MODEL_EP_STATUS.getValue(value)
    if (status) {
      // 更新收视进度
      await userStore.doUpdateEpStatus({
        id: item.id,
        status
      })
      userStore.fetchUserCollection(subjectId)
      userStore.fetchUserProgress(subjectId)
    }

    if (value === '看到') {
      // 批量更新收视进度
      await userStore.doUpdateSubjectWatched({
        subjectId,
        sort: item.sort
      })
      userStore.fetchUserCollection(subjectId)
      userStore.fetchUserProgress(subjectId)
    }

    // iOS是本集讨论, 安卓是(+N)...
    if (value.includes('本集讨论') || value.includes('(+')) {
      appNavigate(item.url, navigation)
    }
  }

  /**
   * 章节按钮长按
   */
  doEpsLongPress = async ({ id }, subjectId) => {
    const userProgress = this.userProgress(subjectId)

    let status
    if (userProgress[id]) {
      // 已观看 -> 撤销
      status = MODEL_EP_STATUS.getValue('撤销')
    } else {
      // 未观看 -> 看过
      status = MODEL_EP_STATUS.getValue('看过')
    }

    await userStore.doUpdateEpStatus({
      id,
      status
    })
    userStore.fetchUserCollection(subjectId)
    userStore.fetchUserProgress(subjectId)
  }
}
