/*
 * App Header占位
 * @Author: czy0729
 * @Date: 2019-04-28 17:04:04
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-08-30 18:09:33
 */
import React from 'react'
import { View } from 'react-native'
import _ from '@styles'

function HeaderPlaceholder({ style, tabs }) {
  let height = _.headerHeight
  if (tabs) {
    height += _.tabsHeight
  }
  return (
    <View
      style={[
        {
          height
        },
        style
      ]}
    />
  )
}

HeaderPlaceholder.defaultProps = {
  style: undefined,
  tabs: false // 是否有tabs
}

export default HeaderPlaceholder
