/* eslint-disable react/no-array-index-key */
/*
 * @Author: czy0729
 * @Date: 2019-09-02 20:30:04
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-22 00:51:43
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { Flex, Text } from '@components'
import { observer } from '@utils/decorators'
import _ from '@styles'
import {
  colorBid,
  colorDepthBid,
  colorAsk,
  colorDepthAsk,
  colorText
} from '../../styles'

function DepthList({ style }, { $ }) {
  const { asks = [], bids = [], _loaded } = $.depth
  if (!_loaded) {
    return null
  }
  if (!asks.length && !bids.length) {
    return null
  }

  let bidsLow = 0
  let bidsHigh = 0
  let bidsAmount = 0
  bids.forEach(item => {
    if (!bidsLow || item.price < bidsLow) {
      bidsLow = item.price
    }
    if (!bidsHigh || item.price > bidsHigh) {
      bidsHigh = item.price
    }
    bidsAmount += item.amount
  })

  let asksLow = 0
  let asksHigh = 0
  let asksAmount = 0
  asks.forEach(item => {
    if (!asksLow || item.price < asksHigh) {
      asksLow = item.price
    }
    if (!asksHigh || item.price > asksLow) {
      asksHigh = item.price
    }
    asksAmount += item.amount
  })

  let calculateBids = 0
  let calculateAsks = 0
  return (
    <View style={[styles.container, style]}>
      <Flex style={styles.header}>
        <Text style={[styles.index, styles.text, _.ml.md]} size={10}>
          买盘
        </Text>
        <Text style={[styles.amount, styles.text]} size={10}>
          数量
        </Text>
        <Flex.Item>
          <Text style={styles.text} size={10} align='center'>
            价格
          </Text>
        </Flex.Item>
        <Text style={[styles.amount, styles.text]} size={10} align='right'>
          数量
        </Text>
        <Text
          style={[styles.index, styles.text, _.mr.md]}
          size={10}
          align='right'
        >
          卖盘
        </Text>
      </Flex>
      <Flex style={_.mt.sm} align='start'>
        <Flex.Item>
          {bids.map((item, index) => {
            calculateBids += item.amount
            return (
              <Flex key={index} style={styles.item}>
                <View style={[styles.index, _.ml.md]}>
                  <Text style={styles.text} size={12}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.amount, styles.text]} size={12}>
                  {item.amount}
                </Text>
                <Flex.Item style={_.mr.sm}>
                  <Text style={styles.bids} size={12} align='right'>
                    {item.price && item.price.toFixed(2)}
                  </Text>
                </Flex.Item>
                <View
                  style={[
                    styles.depthBids,
                    {
                      width: `${(calculateBids / bidsAmount) * 100}%`
                    }
                  ]}
                />
              </Flex>
            )
          })}
        </Flex.Item>
        <Flex.Item>
          {asks.map((item, index) => {
            calculateAsks += item.amount
            return (
              <Flex key={index} style={styles.item}>
                <Flex.Item style={_.ml.sm}>
                  <Text style={styles.asks} size={12}>
                    {item.price && item.price.toFixed(2)}
                  </Text>
                </Flex.Item>
                <Text
                  style={[styles.amount, styles.text]}
                  size={12}
                  align='right'
                >
                  {item.amount}
                </Text>
                <View style={[styles.index, _.mr.md]}>
                  <Text style={styles.text} size={12} align='right'>
                    {index + 1}
                  </Text>
                </View>
                <View
                  style={[
                    styles.depthAsks,
                    {
                      width: `${(calculateAsks / asksAmount) * 100}%`
                    }
                  ]}
                />
              </Flex>
            )
          })}
        </Flex.Item>
      </Flex>
    </View>
  )
}

DepthList.contextTypes = {
  $: PropTypes.object
}

export default observer(DepthList)

const styles = StyleSheet.create({
  container: {
    paddingVertical: _.sm
  },
  header: {
    opacity: 0.5
  },
  item: {
    paddingVertical: 4
  },
  index: {
    minWidth: 40
  },
  amount: {
    minWidth: 40
  },
  bids: {
    color: colorBid
  },
  asks: {
    color: colorAsk
  },
  depthBids: {
    position: 'absolute',
    zIndex: -1,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colorDepthBid
  },
  depthAsks: {
    position: 'absolute',
    zIndex: -1,
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colorDepthAsk
  },
  text: {
    color: colorText
  }
})
