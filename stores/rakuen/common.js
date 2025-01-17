/*
 * @Author: czy0729
 * @Date: 2019-07-13 18:59:53
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-15 20:50:13
 */
import { safeObject, trim } from '@utils'
import { getCoverSmall } from '@utils/app'
import { fetchHTML } from '@utils/fetch'
import {
  HTMLTrim,
  HTMLToTree,
  findTreeNode,
  HTMLDecode,
  cheerio
} from '@utils/html'
import { matchAvatar, matchUserId } from '@utils/match'
import { HTML_RAKUEN } from '@constants/html'
import { INIT_TOPIC, INIT_COMMENTS_ITEM } from './init'

export async function fetchRakuen({ scope, type } = {}) {
  // -------------------- 请求HTML --------------------
  const res = fetchHTML({
    url: HTML_RAKUEN(scope, type)
  })
  const raw = await res
  const HTML = HTMLTrim(raw).match(
    /<div id="eden_tpc_list"><ul>(.+?)<\/ul><\/div>/
  )

  // -------------------- 分析HTML --------------------
  const rakuen = []
  if (HTML) {
    const tree = HTMLToTree(HTML[1])
    tree.children.forEach(item => {
      const avatar = item.children[0].children[0].attrs.style.replace(
        /background-image:url\('|'\)/g,
        ''
      )

      const { children } = item.children[1]
      const title = children[0].text[0]
      const { href = '' } = children[0].attrs
      const replies = children[1].text[0]

      // 小组有可能是没有的
      let group = ''
      let groupHref = ''
      let time = ''
      if (children.length === 3) {
        time = children[2].children[0].text[0]
      } else {
        group = children[3].text[0]
        groupHref = children[3].attrs.href
        time = children[4] ? children[4].text[0] : children[3].text[0]
      }

      const data = {
        title: HTMLDecode(title),
        avatar,
        userName: HTMLDecode(item.children[0].attrs.title),
        href,
        replies,
        group: HTMLDecode(group),
        groupHref,
        time
      }
      rakuen.push(data)
    })
  }

  return Promise.resolve(rakuen)
}

/**
 * 分析留言层信息
 * @param {*} HTML
 */
export function analysisComments(HTML, reverse) {
  const comments = []
  if (!HTML) {
    return comments
  }
  // 回复内容需要渲染html就不能使用node查找了, 而且子回复也在里面
  let messageHTML = HTML[1]
    .match(/<div class="reply_content">(.+?)<\/div><\/div><\/div><\/div>/g)
    .map(item => item.replace(/^<div class="reply_content">|<\/div>$/g, ''))

  if (reverse && messageHTML.length) {
    messageHTML = messageHTML.reverse()
  }

  const tree = HTMLToTree(HTML[1])
  let { children } = tree
  if (reverse && children.length) {
    children = children.reverse()

    // 会有一个评论被折叠的提示
    if (children.length > messageHTML.length) {
      children.shift()
    }
  }
  children.forEach((item, index) => {
    // @todo 暂时只显示前200楼, 因为写法是一次性计算的, 计算太大会爆栈闪退, 待优化
    if (index >= 200) {
      return
    }

    const sub = [] // 存放子回复
    const subHTML =
      messageHTML[index] &&
      messageHTML[index].match(
        /<div class="topic_sub_reply" id="topic_reply_\d+">(.+?)$/
      )
    if (subHTML) {
      const subMessageHTML = subHTML[1]
        .match(/<div id="post_\d+"(.+?)<\/div><\/div><\/div>/g)
        .map(item =>
          item.replace(
            /<div id="post_\d+" class="sub_reply_bgclearit">|<\/div>$/g,
            ''
          )
        )

      const subTree = HTMLToTree(subHTML[1])
      subTree.children.forEach((item, index) => {
        // 子楼层回复内容
        if (subMessageHTML[index]) {
          const message = subMessageHTML[index].match(
            /<div class="cmt_sub_content">(.+?)<\/div><\/div>/
          )[1]
          sub.push({
            ...getCommentAttrs(item),
            message
          })
        }
      })
    }

    // 楼层回复内容
    let message
    if (sub.length) {
      // 某些界面class="message clearit"不一致, 抹平差异
      const match =
        messageHTML[index] &&
        messageHTML[index]
          .replace('class="message clearit"', 'class="message"')
          .match(
            /<div class="message">(.+?)<\/div><div class="topic_sub_reply"/
          )
      message = match ? match[1] : ''
    } else {
      const match =
        messageHTML[index] &&
        messageHTML[index]
          .replace('class="message clearit"', 'class="message"')
          .match(/<div class="message">(.+?)<\/div><\/div>/)
      message = match ? match[1] : ''
    }

    comments.push({
      ...getCommentAttrs(item),
      message,
      sub
    })
  })

  return comments
}

/**
 * 分析留言层信息
 * @param {*} tree
 */
function getCommentAttrs(tree) {
  try {
    let node
    const { children } = tree
    const id = tree.attrs.id.replace('post_', '')

    node = findTreeNode(children, 'div|text&class=re_info')
    const time = node ? node[0].text[0].replace(/ - |\/ /g, '') : ''

    node = findTreeNode(children, 'div > a|class=floor-anchor')
    const floor = node ? node[0].text[0] : ''

    node = findTreeNode(children, 'a > span|style~background-image')
    const avatar = node
      ? node[0].attrs.style.replace(/background-image:url\('|'\)/g, '')
      : ''

    node = findTreeNode(children, 'div > a|text&class~l&href~/user/')
    const userId = node ? node[0].attrs.href.replace('/user/', '') : ''
    const userName = node ? node[0].text[0] : ''

    node = findTreeNode(children, 'div > span|text&class=tip_j')
    const userSign = node ? node[0].text[0] : ''

    // sub reply
    node = findTreeNode(children, 'div > a|onclick')
    const replySub = node ? node[0].attrs.onclick : ''

    return {
      id,
      time,
      floor,
      avatar,
      userId,
      userName: HTMLDecode(userName),
      userSign: HTMLDecode(userSign),
      replySub
    }
  } catch (error) {
    // do nothing
  }

  return INIT_COMMENTS_ITEM
}

/**
 * 分析小组信息
 * @param {*} HTML
 */
export function cheerioGroupInfo(HTML) {
  const $ = cheerio(HTML)

  let joinUrl
  let byeUrl
  const url = $('#groupJoinAction > a.chiiBtn').attr('href') || ''
  if (url.includes('/join?')) {
    joinUrl = url
  } else if (url.includes('/bye?')) {
    byeUrl = url
  }

  return safeObject({
    title: $('.SecondaryNavTitle').text(),
    cover: $('.port.ll').attr('src'),
    content: $('.line_detail .tip')
      .text()
      .replace(/\r\n\r\n|\r\n\r\n\r\n/g, '\r\n'),
    create: $('div.grp_box > span.tip').text(),
    joinUrl,
    byeUrl
  })
}

/**
 * 分析小组帖子列表
 * @param {*} HTML
 */
export function analysisGroup(HTML) {
  return cheerio(HTML)('tr.topic')
    .map((index, element) => {
      const $tr = cheerio(element)
      const $title = $tr.find('.subject > a')
      const $user = $tr.find('.author > a')
      return {
        href: $title.attr('href'),
        title: $title.attr('title'),
        userId: $user.attr('href').replace('/user/', ''),
        userName: $user.text(),
        replies: $tr.find('.posts').text(),
        time: $tr.find('.time').text()
      }
    })
    .get()
}

/**
 * 分析电波提醒列表
 * @param {*} HTML
 */
export function cheerioNotify(HTML) {
  return cheerio(HTML)('div.tml_item')
    .map((index, element) => {
      const $tr = cheerio(element)
      const $name = $tr.find('a.l')
      const $title = $tr.find('a.nt_link')
      const title = $title.text()
      let message
      let message2

      if (title) {
        // eslint-disable-next-line no-extra-semi
        ;[message, message2] = $tr
          .find('div.reply_content')
          .text()
          .split(title)
      } else {
        message = $tr.find('div.reply_content').text()
      }

      return {
        avatar: matchAvatar($tr.find('span.avatarNeue').attr('style')) || '',
        userName: $name.text() || '',
        userId: matchUserId($name.attr('href')) || '',
        title: title || '',
        href: $title.attr('href') || '',
        message: message || '',
        message2: message2 || ''
      }
    })
    .get()
}

/**
 * 分析帖子和留言
 * @param {*} HTML
 */
export function cheerioTopic(HTML) {
  let topic = INIT_TOPIC
  let comments = []

  try {
    const $ = cheerio(HTML)

    // 主楼
    const $group = $('#pageHeader a.avatar')
    const $user = $('div.postTopic strong > a.l')
    const [floor, time] = ($('div.postTopic div.re_info > small').text() || '')
      .split('/')[0]
      .split(' - ')
    const titleText = $('#pageHeader > h1').text() || ''
    let title
    if (titleText.includes(' » ')) {
      title = String(titleText.split(' » ')[1]).replace(/讨论|章节/, '')
    } else {
      title = String(titleText.split(' / ')[1])
    }
    topic = safeObject({
      avatar: getCoverSmall(
        matchAvatar($('div.postTopic span.avatarNeue').attr('style'))
      ),
      floor,
      formhash: $('input[name=formhash]').attr('value'),
      group: String($group.text()).replace(/\n/g, ''),
      groupHref: $group.attr('href'),
      groupThumb: getCoverSmall($('a.avatar > img.avatar').attr('src')),
      lastview: '',
      message: HTMLTrim($('div.topic_content').html()),
      time,
      title,
      userId: matchUserId($user.attr('href')),
      userName: $user.text(),
      userSign: $('div.postTopic span.tip_j').text()
    })

    // 回复
    comments =
      $('#comment_list > div.row_reply')
        .map((index, element) => {
          const $row = cheerio(element)

          const [floor, time] = (
            $row.find('> div.re_info > small').text() || ''
          )
            .split('/')[0] // 这里其实为了去除 / del / edit
            .split(' - ')
          return safeObject({
            ...INIT_COMMENTS_ITEM,
            avatar: getCoverSmall(
              matchAvatar($row.find('span.avatarNeue').attr('style'))
            ),
            floor,
            id: $row.attr('id').substring(5),
            message: HTMLTrim(
              $row.find('> div.inner > div.reply_content > div.message').html()
            ),
            replySub: $row
              .find('> div.inner > span.userInfo > a.icons_cmt')
              .attr('onclick'),
            time,
            userId: matchUserId($row.find('a.avatar').attr('href')),
            userName:
              $row.find('> div.inner > span.userInfo > strong > a.l').text() ||
              $row.find('> div.inner > strong > a.l').text(),
            userSign: $row.find('span.tip_j').text(),

            // 子回复
            sub:
              $row
                .find('div.sub_reply_bg')
                .map((index, element) => {
                  const $row = cheerio(element, {
                    decodeEntities: false
                  })
                  const [floor, time] = ($row.find('small').text() || '')
                    .split('/')[0] // 这里其实为了去除 / del / edit
                    .split(' - ')
                  return safeObject({
                    ...INIT_COMMENTS_ITEM,
                    avatar: getCoverSmall(
                      matchAvatar($row.find('span.avatarNeue').attr('style'))
                    ),
                    floor,
                    id: $row.attr('id').substring(5),
                    message: HTMLTrim($row.find('div.cmt_sub_content').html()),
                    replySub: $row.find('a.icons_cmt').attr('onclick'),
                    time: trim(time),
                    userId: matchUserId($row.find('a.avatar').attr('href')),
                    userName: $row.find('strong > a.l').text(),
                    userSign: $row.find('span.tip_j').text()
                  })
                })
                .get() || []
          })
        })
        .get() || []
  } catch (ex) {
    // do nothing
  }

  return {
    topic,
    comments
  }
}
