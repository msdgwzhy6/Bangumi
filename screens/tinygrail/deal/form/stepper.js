/*
 * @Author: czy0729
 * @Date: 2019-09-11 17:20:59
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-22 01:31:05
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { Flex, Input, Touchable } from '@components'
import { observer } from '@utils/decorators'
import _ from '@styles'
import { colorBorder, colorText } from '../../styles'

function Stepper({ style }, { $ }) {
  const { value } = $.state
  return (
    <Flex style={[styles.stepper, style]}>
      <Flex.Item>
        <Input
          style={styles.input}
          keyboardType='numeric'
          value={String(value)}
          colorClear={colorText}
          clearButtonMode='never'
          onChangeText={$.changeValue}
        />
      </Flex.Item>
      <Touchable onPress={$.stepMinus}>
        <Flex style={[styles.step, styles.stepMinus]} justify='center'>
          <View style={styles.minus} />
        </Flex>
      </Touchable>
      <View style={styles.split} />
      <Touchable onPress={$.stepPlus}>
        <Flex style={styles.step} justify='center'>
          <View style={styles.minus} />
          <View style={styles.plus} />
        </Flex>
      </Touchable>
    </Flex>
  )
}

Stepper.contextTypes = {
  $: PropTypes.object
}

export default observer(Stepper)

const styles = StyleSheet.create({
  stepper: {
    paddingLeft: 4,
    borderColor: colorBorder,
    borderWidth: 1
  },
  input: {
    height: 34,
    color: _.colorPlain,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0
  },
  step: {
    width: 32,
    height: 32
  },
  stepMinus: {
    borderLeftWidth: 1,
    borderLeftColor: colorBorder
  },
  split: {
    width: 1,
    height: 14,
    backgroundColor: colorBorder
  },
  minus: {
    width: 14,
    height: 2,
    backgroundColor: colorText
  },
  plus: {
    position: 'absolute',
    top: 9,
    left: 15,
    width: 2,
    height: 14,
    backgroundColor: colorText
  }
})
