/*
 * 条目
 * @Author: czy0729
 * @Date: 2019-02-27 07:47:57
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-29 11:21:07
 */
import { observable, computed } from 'mobx'
import { LIST_EMPTY, LIST_COMMENTS_LIMIT } from '@constants'
import { API_SUBJECT, API_SUBJECT_EP } from '@constants/api'
import { HTML_SUBJECT, HTML_SUBJECT_COMMENTS, HTML_EP } from '@constants/html'
import { getTimestamp } from '@utils'
import { HTMLTrim, HTMLDecode } from '@utils/html'
import store from '@utils/store'
import { fetchHTML } from '@utils/fetch'
import {
  NAMESPACE,
  INIT_SUBJECT_ITEM,
  INIT_SUBJECT_FROM_HTML_ITEM,
  INIT_MONO
} from './init'
import { fetchMono, cheerioSubjectFormHTML } from './common'

class Subject extends store {
  state = observable({
    /**
     * 条目
     */
    subject: {
      // [subjectId]: INIT_SUBJECT_ITEM
    },

    /**
     * 条目HTML
     */
    subjectFormHTML: {
      // [subjectId]: INIT_SUBJECT_FROM_HTML_ITEM
    },

    /**
     * 条目章节
     */
    subjectEp: {
      // [subjectId]: {}
    },

    /**
     * 条目吐槽箱
     */
    subjectComments: {
      // [subjectId]: LIST_EMPTY
    },

    /**
     * 章节内容
     */
    epFormHTML: {
      // [epId]: ''
    },

    /**
     * 人物
     */
    mono: {
      // [monoId]: INIT_MONO
    },

    /**
     * 人物吐槽箱
     */
    monoComments: {
      // [monoId]: LIST_EMPTY | INIT_MONO_COMMENTS_ITEM
    }
  })

  init = () =>
    this.readStorageThenSetState(
      {
        subject: {},
        subjectFormHTML: {},
        subjectEp: {},
        subjectComments: {},
        mono: {},
        monoComments: {}
      },
      NAMESPACE
    )

  // -------------------- get --------------------
  /**
   * 取条目信息
   * @param {*} subjectId
   */
  subject(subjectId) {
    return computed(
      () => this.state.subject[subjectId] || INIT_SUBJECT_ITEM
    ).get()
  }

  /**
   * 取条目信息
   * @param {*} subjectId
   */
  subjectFormHTML(subjectId) {
    return computed(
      () => this.state.subjectFormHTML[subjectId] || INIT_SUBJECT_FROM_HTML_ITEM
    ).get()
  }

  /**
   * 取章节数据
   * @param {*} subjectId
   */
  subjectEp(subjectId) {
    return computed(() => this.state.subjectEp[subjectId] || {}).get()
  }

  /**
   * 取条目吐槽
   * @param {*} subjectId
   */
  subjectComments(subjectId) {
    return computed(
      () => this.state.subjectComments[subjectId] || LIST_EMPTY
    ).get()
  }

  /**
   * 取章节内容
   * @param {*} epId
   */
  epFormHTML(epId) {
    return computed(() => this.state.epFormHTML[epId] || '').get()
  }

  /**
   * 取人物信息
   * @param {*} monoId
   */
  mono(monoId) {
    return computed(() => this.state.mono[monoId] || INIT_MONO).get()
  }

  /**
   * 取人物信息吐槽
   * @param {*} monoId
   */
  monoComments(monoId) {
    return computed(() => this.state.monoComments[monoId] || LIST_EMPTY).get()
  }

  // -------------------- fetch --------------------
  /**
   * 条目信息
   * @param {*} subjectId
   */
  fetchSubject(subjectId) {
    return this.fetch(
      {
        url: API_SUBJECT(subjectId),
        data: {
          responseGroup: 'large'
        },
        info: '条目信息'
      },
      ['subject', subjectId],
      {
        storage: true,
        namespace: NAMESPACE
      }
    )
  }

  /**
   * 网页获取条目信息
   * @param {*} subjectId
   */
  async fetchSubjectFormHTML(subjectId) {
    const HTML = await fetchHTML({
      url: HTML_SUBJECT(subjectId)
    })
    const key = 'subjectFormHTML'
    const data = {
      ...cheerioSubjectFormHTML(HTML),
      _loaded: getTimestamp()
    }
    this.setState({
      [key]: {
        [subjectId]: data
      }
    })
    this.setStorage(key, undefined, NAMESPACE)
    return Promise.resolve(data)
  }

  /**
   * 章节数据
   * @param {*} subjectId
   */
  fetchSubjectEp(subjectId) {
    return this.fetch(
      {
        url: API_SUBJECT_EP(subjectId),
        info: '章节数据'
      },
      ['subjectEp', subjectId],
      {
        storage: true,
        namespace: NAMESPACE
      }
    )
  }

  /**
   * 网页获取留言
   * @param {*} subjectId
   * @param {*} refresh 是否重新获取
   * @param {*} reverse 是否倒序
   */
  async fetchSubjectComments({ subjectId }, refresh, reverse) {
    const { list, pagination, _reverse } = this.subjectComments(subjectId)
    let page // 下一页的页码

    // @notice 倒序的实现逻辑: 默认第一次是顺序, 所以能拿到总页数
    // 点击倒序根据上次数据的总页数开始递减请求, 处理数据时再反转入库
    let isReverse = reverse
    if (!isReverse && !refresh) {
      isReverse = _reverse
    }

    if (isReverse) {
      if (refresh) {
        // @issue 官网某些条目留言不知道为什么会多出一页空白
        page = pagination.pageTotal - 1
      } else {
        page = pagination.page - 1
      }
    } else if (refresh) {
      page = 1
    } else {
      page = pagination.page + 1
    }

    // -------------------- 请求HTML --------------------
    const res = fetchHTML({
      url: HTML_SUBJECT_COMMENTS(subjectId, page)
    })
    const raw = await res
    const html = raw.replace(/\s+/g, '')
    const commentsHTML = html.match(
      /<divid="comment_box">(.+?)<\/div><\/div><divclass="section_lineclear">/
    )

    // -------------------- 分析HTML --------------------
    // @todo 使用新的HTML解释函数重写
    const comments = []
    let { pageTotal = 0 } = pagination
    if (commentsHTML) {
      /**
       * 总页数
       * @tucao 晕了, 至少有三种情况, 其实在第一页的时候获取就足够了
       * [1] 超过10页的, 有总页数
       * [2] 少于10页的, 需要读取最后一个分页按钮获取页数
       * [3] 只有1页, 没有分页按钮
       */
      if (page === 1) {
        const pageHTML =
          html.match(
            /<spanclass="p_edge">\(&nbsp;\d+&nbsp;\/&nbsp;(\d+)&nbsp;\)<\/span>/
          ) ||
          html.match(
            /<ahref="\?page=\d+"class="p">(\d+)<\/a><ahref="\?page=2"class="p">&rsaquo;&rsaquo;<\/a>/
          )
        if (pageHTML) {
          pageTotal = pageHTML[1]
        } else {
          pageTotal = 1
        }
      }

      // 留言
      let items = commentsHTML[1].split('<divclass="itemclearit">')
      items.shift()

      if (isReverse) {
        items = items.reverse()
      }
      items.forEach((item, index) => {
        const userId = item.match(
          /<divclass="text"><ahref="\/user\/(.+?)"class="l">/
        )
        const userName = item.match(/"class="l">(.+?)<\/a><smallclass="grey"/)
        const avatar = item.match(/background-image:url\('(.+?)'\)"><\/span>/)
        const time = item.match(/<smallclass="grey">@(.+?)<\/small>/)
        const star = item.match(/starlightstars(.+?)"/)
        const comment = item.match(/<p>(.+?)<\/p>/)
        comments.push({
          id: `${page}|${index}`,
          userId: userId ? userId[1] : '',
          userName: userName ? HTMLDecode(userName[1]) : '',
          avatar: avatar ? avatar[1] : '',
          time: time ? time[1] : '',
          star: star ? star[1] : '',
          comment: comment ? HTMLDecode(comment[1]) : ''
        })
      })
    }

    // -------------------- 缓存 --------------------
    const key = 'subjectComments'
    this.setState({
      [key]: {
        [subjectId]: {
          list: refresh ? comments : [...list, ...comments],
          pagination: {
            page,
            pageTotal: parseInt(pageTotal)
          },
          _loaded: getTimestamp(),
          _reverse: isReverse
        }
      }
    })
    this.setStorage(key, undefined, NAMESPACE)
    return res
  }

  /**
   * 章节内容
   * @param {*} epId
   */
  async fetchEpFormHTML(epId) {
    // -------------------- 请求HTML --------------------
    const res = fetchHTML({
      url: `!${HTML_EP(epId)}`
    })
    const raw = await res
    const HTML = HTMLTrim(raw)

    // -------------------- 分析HTML --------------------
    const contentHTML = HTML.match(/<div class="epDesc">(.+?)<\/div>/)
    if (contentHTML) {
      this.setState({
        epFormHTML: {
          [epId]: contentHTML[0]
        }
      })
    }

    return res
  }

  /**
   * 人物信息和吐槽箱
   * 为了提高体验, 吐槽箱做模拟分页加载效果, 逻辑与超展开回复一致
   * @param {*} monoId
   */
  async fetchMono({ monoId }, refresh) {
    let res
    const monoKey = 'mono'
    const commentsKey = 'monoComments'
    const stateKey = monoId

    if (refresh) {
      // 重新请求
      res = fetchMono({ monoId })
      const { mono, monoComments } = await res
      const _loaded = getTimestamp()

      // 缓存人物信息
      this.setState({
        [monoKey]: {
          [stateKey]: {
            ...mono,
            _loaded
          }
        }
      })
      this.setStorage(monoKey, undefined, NAMESPACE)

      // 缓存吐槽箱
      this.setState({
        [commentsKey]: {
          [stateKey]: {
            list: monoComments.slice(0, LIST_COMMENTS_LIMIT),
            pagination: {
              page: 1,
              pageTotal: Math.ceil(monoComments.length / LIST_COMMENTS_LIMIT)
            },
            _list: monoComments,
            _loaded
          }
        }
      })
      this.setStorage(commentsKey, undefined, NAMESPACE)
    } else {
      // 加载下一页留言
      const monoComments = this.monoComments(monoId)
      const page = monoComments.pagination.page + 1
      this.setState({
        [commentsKey]: {
          [stateKey]: {
            ...monoComments,
            list: monoComments._list.slice(0, LIST_COMMENTS_LIMIT * page),
            pagination: {
              ...monoComments.pagination,
              page
            }
          }
        }
      })
      this.setStorage(commentsKey, undefined, NAMESPACE)
    }
    return res
  }
}

export default new Subject()
