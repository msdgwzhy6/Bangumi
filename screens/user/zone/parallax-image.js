/*
 * @Author: czy0729
 * @Date: 2019-05-08 19:32:34
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-08-27 19:28:20
 */
import React from 'react'
import { StyleSheet, Animated, View, Alert } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Iconfont, Text } from '@components'
import { Popover, IconBack } from '@screens/_'
import { open } from '@utils'
import { HTMLDecode } from '@utils/html'
import { IOS, HOST } from '@constants'
import _ from '@styles'
import Head from './head'
import { height, headerHeight } from './store'

function ParallaxImage({ scrollY }, { $, navigation }) {
  const { avatar = {}, nickname, id, username } = $.usersInfo
  const parallaxStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-height, 0, height - headerHeight, height],
          outputRange: [
            height / 2,
            0,
            -(height - headerHeight),
            -(height - headerHeight)
          ]
        })
      },
      {
        scale: scrollY.interpolate({
          inputRange: [-height, 0, height],

          // -h: 2, 0: 1, h: 1 当scrollY在-h到0时, scale按照2-1的动画运动
          // 当scrollY在0-h时, scale不变. 可以输入任意数量对应的值, 但必须是递增或者相等
          outputRange: [2, 1, 1]
        })
      }
    ]
  }
  const data = ['浏览器查看', 'TA的好友', 'TA的收藏信息']
  if ($.users.connectUrl) {
    data.push('加为好友')
  } else if ($.users.disconnectUrl) {
    data.push('解除好友')
  }
  return (
    <>
      <View style={styles.parallax} pointerEvents='none'>
        <Animated.Image
          style={[styles.parallaxImage, parallaxStyle]}
          source={{ uri: avatar.large }}
          blurRadius={2}
        />
        <Animated.View
          style={[
            styles.parallaxMask,
            parallaxStyle,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.48)',
              opacity: scrollY.interpolate({
                inputRange: [-height, 0, height - headerHeight, height],
                outputRange: [0, 0.4, 1, 1]
              })
            }
          ]}
        />
        <Animated.View
          style={[
            styles.parallaxMask,
            parallaxStyle,
            {
              opacity: scrollY.interpolate({
                inputRange: [-height, 0, height - headerHeight, height],
                outputRange: [0, 0, 1, 1]
              })
            }
          ]}
        >
          <Text
            style={styles.title}
            type='plain'
            size={16}
            align='center'
            numberOfLines={1}
          >
            {HTMLDecode(nickname)}
          </Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.parallaxMask,
            parallaxStyle,
            {
              opacity: scrollY.interpolate({
                inputRange: [-height, 0, height - headerHeight, height],
                outputRange: [1, 1, 0, 0]
              })
            }
          ]}
        >
          <Head style={styles.head} />
        </Animated.View>
      </View>
      <IconBack style={[_.header.left, styles.btn]} navigation={navigation} />
      <View
        style={[
          _.header.right,
          styles.btn,
          {
            padding: _.sm
          }
        ]}
      >
        <Popover
          data={data}
          onSelect={label => {
            switch (label) {
              case '浏览器查看':
                open(`${HOST}/user/${username}`)
                break
              case 'TA的好友':
                navigation.push('Friends', {
                  userId: username || id
                })
                break
              case 'TA的收藏信息':
                navigation.push('User', {
                  userId: username,
                  _name: HTMLDecode(nickname),
                  _image: avatar.large
                })
                break
              case '加为好友':
                $.doConnectFriend()
                break
              case '解除好友':
                setTimeout(() => {
                  Alert.alert('警告', '确定解除好友?', [
                    {
                      text: '取消',
                      style: 'cancel'
                    },
                    {
                      text: '确定',
                      onPress: () => $.doDisconnectFriend()
                    }
                  ])
                }, 400)
                break
              default:
                break
            }
          }}
        >
          <Iconfont size={24} name='more' color={_.colorPlain} />
        </Popover>
      </View>
    </>
  )
}

ParallaxImage.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(ParallaxImage)

const styles = StyleSheet.create({
  parallax: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
    left: 0
  },
  parallaxImage: {
    height
  },
  parallaxMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  head: {
    marginTop: 76
  },
  title: {
    position: 'absolute',
    left: '50%',
    width: 200,
    bottom: _.sm + (IOS ? 5 : 12),
    transform: [
      {
        translateX: -100
      }
    ]
  },
  tabs: {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    right: 0
  },
  btn: {
    zIndex: 1
  }
  // friends: {
  //   right: 44
  // }
})
