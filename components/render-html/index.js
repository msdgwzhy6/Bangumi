/*
 * RN渲染HTML v2
 * @Doc https://github.com/archriss/react-native-render-html
 * @Author: czy0729
 * @Date: 2019-04-29 19:54:57
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-20 17:33:18
 */
import React from 'react'
import { View } from 'react-native'
import { open } from '@utils'
import { cheerio } from '@utils/html'
import _ from '@styles'
import HTML from '../@/react-native-render-html'
import BgmText, { bgmMap } from '../bgm-text'
import MaskText from './mask-text'
import QuoteText from './quote-text'
import LineThroughtText from './line-throught-text'
import HiddenText from './hidden-text'
import Li from './li'
import ToggleImage from './toggle-image'

// 一些超展开内容文本样式的标记
const spanMark = {
  mask: 'background-color:#555;',
  bold: 'font-weight:bold;',
  lineThrough: 'line-through;',
  hidden: 'visibility:hidden;'
}

export default class RenderHtml extends React.Component {
  static defaultProps = {
    style: undefined,
    baseFontStyle: {
      fontSize: 16 + _.fontSizeAdjust,
      lineHeight: 26,
      color: _.colorTitle
    },
    linkStyle: {},
    imagesMaxWidth: _.window.width - 2 * _.wind,
    html: '',
    autoShowImage: false,
    onLinkPress: Function.prototype
  }

  /**
   * 生成render-html配置
   */
  generateConfig = (imagesMaxWidth, baseFontStyle, linkStyle) => ({
    imagesMaxWidth: _.window.width,
    baseFontStyle,
    tagsStyles: {
      a: {
        paddingRight: _.sm,
        color: _.colorMain,
        textDecorationColor: _.colorMain,
        ...linkStyle
      }
    },
    textSelectable: true,

    // 渲染定义tag前回调
    renderers: {
      img: ({ src = '' }, children, convertedCSSStyles, { key }) => {
        const { autoShowImage } = this.props
        return (
          <ToggleImage
            key={key}
            style={{
              marginTop: 4
            }}
            src={src}
            autoSize={imagesMaxWidth}
            placeholder={false}
            imageViewer
            show={autoShowImage}
          />
        )
      },
      span: (
        { style = '' },
        children,
        convertedCSSStyles,
        { rawChildren, key, baseFontStyle }
      ) => {
        // @todo 暂时没有对样式混合情况作出正确判断, 以重要程度优先(剧透 > 删除 > 隐藏 > 其他)
        // 防剧透字
        if (style.includes(spanMark.mask)) {
          const text = []
          const target = rawChildren[0]
          if (target) {
            if (target.children) {
              // 防剧透字中有表情
              target.children.forEach((item, index) => {
                if (item.data) {
                  // 文字
                  text.push(item.data)
                } else if (item.children) {
                  item.children.forEach((i, idx) => {
                    // 表情
                    text.push(
                      <BgmText
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${index}-${idx}`}
                        size={baseFontStyle.fontSize}
                        lineHeight={baseFontStyle.lineHeight}
                      >
                        {i.data}
                      </BgmText>
                    )
                  })
                }
              })
            } else {
              // 防剧透字中没表情
              text.push(target.data)
            }
          }
          return (
            <MaskText key={key} style={baseFontStyle}>
              {text}
            </MaskText>
          )
        }

        // 删除字
        if (style.includes(spanMark.lineThrough)) {
          const target = rawChildren[0]
          const text =
            (target &&
              target.parent &&
              target.parent.children[0] &&
              target.parent.children[0].data) ||
            (target.children[0] && target.children[0].data) ||
            ''
          return (
            <LineThroughtText key={key} style={baseFontStyle}>
              {text}
            </LineThroughtText>
          )
        }

        // 隐藏字
        if (style.includes(spanMark.hidden)) {
          const target = rawChildren[0]
          const text = (target && target.data) || ''
          return (
            <HiddenText key={key} style={baseFontStyle}>
              {text}
            </HiddenText>
          )
        }

        return children
      },
      q: (attrs, children, convertedCSSStyles, { key }) => (
        <QuoteText key={key}>{children}</QuoteText>
      ),
      li: (attrs, children, convertedCSSStyles, { key }) => (
        <Li key={key}>{children}</Li>
      )
    }
  })

  onLinkPress = (evt, href) => {
    const { onLinkPress } = this.props
    if (onLinkPress) {
      onLinkPress(href)
    } else {
      open(href)
    }
  }

  formatHTML = () => {
    const { html, baseFontStyle } = this.props
    let _html

    // 把bgm表情替换成bgm字体文字
    const $ = cheerio(html)
    $('img[smileid]').replaceWith((index, element) => {
      const $img = cheerio(element)
      const alt = $img.attr('alt') || ''
      if (alt) {
        // bgm偏移量24
        const index = parseInt(alt.replace(/\(bgm|\)/g, '')) - 24
        if (bgmMap[index]) {
          return `<span style="font-family:bgm;font-size:${baseFontStyle.fontSize}px;line-height:${baseFontStyle.lineHeight}px;user-select:all">${bgmMap[index]}</span>`
        }
        return alt
      }
      return $img.html()
    })
    _html = $.html()

    // 给纯文字包上span, 否则安卓不能自由复制
    _html = `<div>${_html}</div>`
    const match = _html.match(/>[^<>]+?</g)
    if (match) {
      match.forEach(
        item => (_html = _html.replace(item, `><span${item}/span><`))
      )
    }

    return _html
  }

  render() {
    const {
      style,
      baseFontStyle,
      linkStyle,
      imagesMaxWidth,
      html,
      autoShowImage,
      onLinkPress,
      ...other
    } = this.props
    return (
      <View style={style}>
        <HTML
          html={this.formatHTML()}
          baseFontStyle={baseFontStyle}
          onLinkPress={this.onLinkPress}
          {...this.generateConfig(imagesMaxWidth, baseFontStyle, linkStyle)}
          {...other}
        />
      </View>
    )
  }
}
