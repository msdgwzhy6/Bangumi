/*
 * @Author: czy0729
 * @Date: 2019-05-20 22:29:09
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-09 14:52:32
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Text, Button } from '@components'
import _ from '@styles'

function Login(props, { navigation }) {
  return (
    <View style={[_.container.screen, _.container.column]}>
      <Text type='sub' size={16}>
        cookie已过期
      </Text>
      <Button
        style={[
          {
            width: 160
          },
          _.mt.md
        ]}
        shadow
        onPress={() => navigation.push('LoginV2')}
      >
        重新登陆
      </Button>
    </View>
  )
}

Login.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(Login)
