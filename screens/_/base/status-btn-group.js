/*
 * @Author: czy0729
 * @Date: 2019-03-20 00:27:19
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-08-10 21:01:39
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import { Flex, Button } from '@components'
import { MODEL_COLLECTION_STATUS } from '@constants/model'
import { getType } from '@utils/app'

function StatusBtnGroup({ style, value, action, onSelect }) {
  return (
    <Flex style={style}>
      {MODEL_COLLECTION_STATUS.data.map((item, index) => (
        <Flex.Item key={item.label}>
          <Button
            style={styles[`btn${index}`]}
            type={
              MODEL_COLLECTION_STATUS.getLabel(value) === item.label
                ? getType(item.label)
                : 'plain'
            }
            radius={!(index !== 0 && index !== 4)}
            onPress={() => onSelect(item.value)}
          >
            {item.label.replace('看', action)}
          </Button>
        </Flex.Item>
      ))}
    </Flex>
  )
}

StatusBtnGroup.defaultProps = {
  value: 0,
  action: '看',
  onSelect: Function.prototype
}

export default StatusBtnGroup

const styles = StyleSheet.create({
  btn0: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  btn4: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  }
})
