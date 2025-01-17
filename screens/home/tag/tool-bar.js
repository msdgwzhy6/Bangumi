/*
 * @Author: czy0729
 * @Date: 2019-06-08 04:35:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-30 14:09:18
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Flex, Iconfont, Text, Touchable } from '@components'
import { Popover } from '@screens/_'
import { observer } from '@utils/decorators'
import { airtimeData } from '@constants'
import { MODEL_TAG_ORDERBY } from '@constants/model'
import _ from '@styles'

const orderData = MODEL_TAG_ORDERBY.data.map(item => item.label)

function ToolBar(props, { $ }) {
  const { order, list, airtime } = $.state
  const isEmptyAirdate = airtime === ''
  return (
    <Flex style={styles.container}>
      <Flex.Item>
        <Popover data={orderData} onSelect={$.onOrderSelect}>
          <Flex style={styles.item} justify='center'>
            <Iconfont
              name='sort'
              size={14}
              color={order ? _.colorMain : undefined}
            />
            <Text
              style={_.ml.sm}
              type={order ? 'main' : 'sub'}
              numberOfLines={1}
            >
              {order ? MODEL_TAG_ORDERBY.getLabel(order) : '名称'}
            </Text>
          </Flex>
        </Popover>
      </Flex.Item>
      <Flex.Item>
        <Popover data={airtimeData} onSelect={$.onAirdateSelect}>
          <Flex style={styles.item} justify='center'>
            <Iconfont
              name='calendar'
              size={14}
              color={isEmptyAirdate ? _.colorSub : _.colorMain}
            />
            <Text style={_.ml.sm} type={isEmptyAirdate ? 'sub' : 'main'}>
              {airtime || '年份'}
            </Text>
          </Flex>
        </Popover>
      </Flex.Item>
      <Flex.Item>
        <Touchable onPress={$.toggleList}>
          <Flex style={styles.item} justify='center'>
            <Iconfont
              name='list'
              size={14}
              color={list ? _.colorMain : undefined}
            />
            <Iconfont
              style={_.ml.md}
              name='order'
              size={14}
              color={!list ? _.colorMain : undefined}
            />
          </Flex>
        </Touchable>
      </Flex.Item>
    </Flex>
  )
}

ToolBar.contextTypes = {
  $: PropTypes.object
}

export default observer(ToolBar)

const styles = StyleSheet.create({
  container: {
    backgroundColor: _.colorBg
  },
  item: {
    padding: _.sm + 4
  },
  touchable: {
    paddingHorizontal: _.lg
  }
})
