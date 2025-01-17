/*
 * @Author: czy0729
 * @Date: 2019-10-08 17:37:38
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-20 17:33:52
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { Flex, Text, RenderHtml } from '@components'
import { Avatar } from '@screens/_'
import { observer } from '@utils/decorators'
import { appNavigate } from '@utils/app'
import _ from '@styles'

function Chat(props, { $, navigation }) {
  const { list } = $.say
  return (
    <View style={styles.container}>
      <Text size={12} type='sub' align='center'>
        {!!list.length && list[0].date}
      </Text>
      {list.map((item, index) => {
        const isMe = item.id === $.myId
        if (isMe) {
          const { avatar = {} } = $.userInfo
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Flex key={index} style={_.mt.md} align='start'>
              <Flex.Item>
                <Flex direction='column' align='end'>
                  <Text size={12} type='sub'>
                    {item.name}
                  </Text>
                  <View style={[styles.text, styles.textActive, _.mt.sm]}>
                    <RenderHtml
                      baseFontStyle={{
                        fontSize: 14 + _.fontSizeAdjust,
                        lineHeight: 22,
                        color: _.colorPlain
                      }}
                      linkStyle={{
                        color: _.colorPlain,
                        textDecorationColor: _.colorPlain
                      }}
                      html={getBgmHtml(item.text)}
                      onLinkPress={href => appNavigate(href, navigation)}
                    />
                  </View>
                </Flex>
              </Flex.Item>
              <Avatar
                style={_.ml.sm}
                navigation={navigation}
                src={avatar.medium}
                size={28}
                userId={item.id}
              />
            </Flex>
          )
        }

        const { avatar = {} } = $.usersInfo(item.id)
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Flex key={index} style={_.mt.md} align='start'>
            <Avatar
              navigation={navigation}
              src={item.avatar || avatar.medium}
              size={28}
              userId={item.id}
              onLongPress={() => $.at(item.id)}
            />
            <Flex.Item style={_.ml.sm}>
              <Flex direction='column' align='start'>
                <Text size={12} type='sub'>
                  {item.name}
                </Text>
                <View style={[styles.text, _.mt.sm]}>
                  <RenderHtml
                    baseFontStyle={{
                      fontSize: 14 + _.fontSizeAdjust,
                      lineHeight: 22
                    }}
                    html={getBgmHtml(item.text)}
                    onLinkPress={href => appNavigate(href, navigation)}
                  />
                </View>
              </Flex>
            </Flex.Item>
          </Flex>
        )
      })}
    </View>
  )
}

Chat.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(Chat)

const styles = StyleSheet.create({
  loading: {
    height: 240
  },
  container: {
    padding: _.wind
  },
  text: {
    padding: 12,
    marginRight: 24,
    backgroundColor: _.colorPlain,
    borderRadius: 16,
    borderTopLeftRadius: 0
  },
  textActive: {
    marginRight: 0,
    marginLeft: 24,
    backgroundColor: _.colorPrimary,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 16
  }
})

function getBgmHtml(html = '') {
  let _html = html
  const matchs = _html.match(/\(bgm\d+\)/g) || []
  if (matchs.length) {
    matchs.forEach(item => {
      const index = parseInt(item.match(/\d+/g)[0])

      // 防止2连同一个bgm表情, 替换不了后面的
      _html = _html.replace(item, `<img smileid alt="(bgm~~~${index})" />`)
    })
  }

  return _html.replace(/~~~/g, '')
}
