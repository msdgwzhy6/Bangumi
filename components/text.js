/*
 * 支持各种属性设置的文本
 * @Author: czy0729
 * @Date: 2019-03-15 06:11:55
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-02 02:43:10
 */
import React from 'react'
import { StyleSheet, Text as RNText } from 'react-native'
import { IOS } from '@constants'
import _ from '@styles'

function Text({
  style,
  type,
  underline,
  size,
  lineHeight,
  align,
  bold,
  children,
  ...other
}) {
  const _style = [styles.text]
  if (type) {
    _style.push(styles[type])
  }
  if (underline) {
    _style.push(styles.underline)
  }
  if (size) {
    _style.push(styles[size])
  }
  if (lineHeight !== undefined) {
    _style.push({
      lineHeight:
        lineHeight <= 2 ? lineHeight * size : lineHeight * _.lineHeightRatio
    })
  }
  if (align) {
    _style.push(align === 'right' ? styles.alignRight : styles.alignCenter)
  }
  if (bold) {
    _style.push(styles.bold)
  }
  if (style) {
    _style.push(style)
  }

  return (
    <RNText style={_style} allowFontScaling={false} selectable {...other}>
      {children}
    </RNText>
  )
}

Text.defaultProps = {
  style: undefined,
  type: 'desc',
  underline: false,
  size: 14,
  lineHeight: undefined,
  align: undefined,
  bold: false,
  children: ''
}

export default Text

const styles = StyleSheet.create({
  text: IOS
    ? {
        fontWeight: 'normal'
      }
    : {},
  alignCenter: {
    textAlign: 'center'
  },
  alignRight: {
    textAlign: 'right'
  },
  bold: IOS
    ? {
        fontWeight: 'bold'
      }
    : {},
  10: _.fontSize(10),
  11: _.fontSize(11),
  12: _.fontSize(12),
  13: _.fontSize(13),
  14: _.fontSize(14),
  15: _.fontSize(15),
  16: _.fontSize(16),
  18: _.fontSize(18),
  20: _.fontSize(20),
  22: _.fontSize(22),
  24: _.fontSize(24),
  26: _.fontSize(26),
  28: _.fontSize(28),
  plain: {
    color: 'rgba(255, 255, 255, 0.92)'
  },
  main: {
    color: _.colorMain
  },
  primary: {
    color: _.colorPrimary
  },
  success: {
    color: _.colorSuccess
  },
  warning: {
    color: _.colorWarning
  },
  danger: {
    color: _.colorDanger
  },
  title: {
    color: _.colorTitle
  },
  desc: {
    color: _.colorDesc
  },
  avatar: {
    color: _.colorAvatar
  },
  sub: {
    color: _.colorSub
  },
  icon: {
    color: _.colorIcon
  },
  border: {
    color: _.colorBorder
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationColor: _.colorMain
  }
})
