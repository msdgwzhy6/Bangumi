/*
 * @Author: czy0729
 * @Date: 2019-05-17 05:06:01
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-09 14:56:04
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import { Text } from '@components'
import _ from '@styles'

function Tag({ style, type, value }) {
  if (!value) {
    return null
  }

  let _type = type
  if (!_type) {
    switch (value) {
      case '动画':
      case '主角':
        _type = 'main'
        break
      case '书籍':
      case '配角':
        _type = 'primary'
        break
      case '游戏':
        _type = 'success'
        break
      case '音乐':
      case '客串':
        _type = 'warning'
        break
      case '三次元':
        _type = 'plain'
        break
      default:
        _type = 'plain'
        break
    }
  }

  return (
    <Text style={[styles.tag, styles[_type], style]} type='sub' size={11}>
      {value}
    </Text>
  )
}

export default Tag

const styles = StyleSheet.create({
  tag: {
    paddingVertical: 1,
    paddingHorizontal: _.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: _.radiusXs
  },
  main: {
    backgroundColor: _.colorMainLight,
    borderColor: _.colorMainBorder
  },
  primary: {
    backgroundColor: _.colorPrimaryLight,
    borderColor: _.colorPrimaryBorder
  },
  success: {
    backgroundColor: _.colorSuccessLight,
    borderColor: _.colorSuccessBorder
  },
  warning: {
    backgroundColor: _.colorWarningLight,
    borderColor: _.colorWarningBorder
  },
  plain: {
    backgroundColor: _.colorBg,
    borderColor: _.colorBorder
  }
})
