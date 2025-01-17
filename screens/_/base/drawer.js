/*
 * @Author: czy0729
 * @Date: 2019-04-23 21:04:58
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-09 14:52:04
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView, DrawerItems } from 'react-navigation'
import { DrawerActions } from 'react-navigation-drawer'
import { observer } from 'mobx-react'
import { BlurView, Flex, Image, Text, Touchable } from '@components'
import { IconDrawer } from '@screens/_'
import { userStore } from '@stores'
import _ from '@styles'
import StatusBarPlaceholder from './status-bar-placeholder'

const contentOptions = {
  activeTintColor: _.colorMain,
  activeBackgroundColor: _.colorPlain,
  inactiveTintColor: _.colorDesc,
  inactiveBackgroundColor: _.colorPlain,
  labelStyle: {
    marginLeft: 0,
    fontWeight: 'normal'
  }
}

function Drawer({ navigation, ...otherProps }) {
  const { avatar = {}, nickname, id } = userStore.userInfo
  return (
    <SafeAreaView
      style={_.container.flex}
      forceInset={{ top: 'never', horizontal: 'always' }}
    >
      <View style={_.container.flex}>
        <BlurView style={_.container.outer} theme='xlight' src={avatar.large}>
          <StatusBarPlaceholder
            style={{
              backgroundColor: 'transparent'
            }}
          />
          <View style={{ width: 80 }}>
            <Image src={avatar.large} size={80} radius border={_.colorBorder} />
          </View>
          <Text style={_.mt.sm} size={16}>
            {nickname}
            <Text type='sub' lineHeight={16}>
              {' '}
              @{id}
            </Text>
          </Text>
        </BlurView>
        <DrawerItems
          navigation={navigation}
          {...otherProps}
          {...contentOptions}
        />
      </View>
      <Flex>
        <Flex.Item>
          <Touchable>
            <Flex style={styles.bottom}>
              <IconDrawer name='setting' />
              <Text style={styles.bottomText}>设置</Text>
            </Flex>
          </Touchable>
        </Flex.Item>
        <Flex.Item>
          <Touchable
            onPress={async () => {
              await userStore.logout()
              navigation.dispatch(DrawerActions.closeDrawer())
              navigation.navigate('Auth')
            }}
          >
            <Flex style={styles.bottom}>
              <IconDrawer name='logout' />
              <Text style={styles.bottomText}>注销</Text>
            </Flex>
          </Touchable>
        </Flex.Item>
      </Flex>
    </SafeAreaView>
  )
}

export default observer(Drawer)

const styles = StyleSheet.create({
  bottom: {
    paddingVertical: 14,
    paddingLeft: 17,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: _.colorBorder
  },
  bottomText: {
    marginLeft: 18
  }
})
