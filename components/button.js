/*
 * 自定义按钮
 * @Author: czy0729
 * @Date: 2019-03-15 02:32:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-20 17:32:17
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivityIndicator } from '@ant-design/react-native'
import { titleCase } from '@utils'
import { IOS } from '@constants'
import _ from '@styles'
import Flex from './flex'
import Text from './text'
import Touchable from './touchable'

function Button({
  style,
  styleText,
  type,
  size,
  shadow,
  radius,
  loading,
  children,
  onPress,
  ...other
}) {
  const _wrap = [styles.button]
  const _text = [styles.text]

  // @notice 安卓的阴影要保证有背景颜色才能显示, 所以为了不覆盖type的bg, 放在type前面
  if (shadow) {
    _wrap.push(styles.shadow)
  }
  if (type) {
    _wrap.push(styles[type])
    _text.push(styles[`text${titleCase(type)}`])
  }
  if (size) {
    _wrap.push(styles[size])
    _text.push(styles[`text${titleCase(size)}`])
  }
  if (radius) {
    _wrap.push(styles.radius)
  }
  if (style) {
    _wrap.push(style)
  }

  const content = (
    <Flex justify='center'>
      {loading && (
        <View style={_.mr.xs}>
          <ActivityIndicator color='white' size='small' />
        </View>
      )}
      <Text
        style={[
          // @notice 部分安卓机不写具体width会导致文字显示不全
          size === 'sm' && {
            width: 32
          },
          _text,
          styleText
        ]}
        align='center'
        selectable={false}
      >
        {children}
      </Text>
    </Flex>
  )

  if (onPress) {
    return (
      <Touchable style={_wrap} onPress={onPress} {...other}>
        {content}
      </Touchable>
    )
  }

  return (
    <View style={_wrap} {...other}>
      {content}
    </View>
  )
}

Button.defaultProps = {
  style: undefined,
  styleText: undefined,
  type: 'plain',
  size: 'md',
  shadow: false,
  radius: true,
  loading: false
}

export default Button

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth
  },

  // type
  plain: {
    backgroundColor: _.colorPlain,
    borderColor: 'rgb(223, 223, 223)'
  },
  main: {
    backgroundColor: _.colorMain,
    borderColor: 'rgb(255, 54, 76)'
  },
  primary: {
    backgroundColor: _.colorPrimary,
    borderColor: 'rgb(13, 156, 204)'
  },
  warning: {
    backgroundColor: _.colorWarning,
    borderColor: 'rgb(249, 163, 80)'
  },
  wait: {
    backgroundColor: _.colorWait,
    borderColor: 'rgb(160, 160, 160)'
  },
  disabled: {
    backgroundColor: _.colorDisabled,
    borderColor: 'rgb(80, 80, 80)'
  },
  bid: {
    backgroundColor: _.colorBid,
    borderColor: _.colorBid
  },

  // ghost type
  ghostPlain: {
    backgroundColor: _.colorBg,
    borderColor: _.colorBorder
  },
  ghostMain: {
    backgroundColor: _.colorMainLight,
    borderColor: _.colorMainBorder
  },
  ghostPrimary: {
    backgroundColor: _.colorPrimaryLight,
    borderColor: _.colorPrimaryBorder
  },
  ghostSuccess: {
    backgroundColor: _.colorSuccessLight,
    borderColor: _.colorSuccessBorder
  },

  // size
  sm: {
    width: 32,
    height: 32
  },
  md: {
    width: '100%',
    height: 40
  },

  // text
  text: {
    fontSize: 14 + _.fontSizeAdjust
  },
  textSm: {
    fontSize: 11 + _.fontSizeAdjust,
    fontWeight: 'bold'
  },
  textPlain: {
    color: _.colorDesc
  },
  textMain: {
    color: _.colorPlain
  },
  textPrimary: {
    color: _.colorPlain
  },
  textWarning: {
    color: _.colorPlain
  },
  textWait: {
    color: _.colorPlain
  },
  textDisabled: {
    color: _.colorPlain
  },
  textBid: {
    color: _.colorPlain
  },
  textGhostPlain: {
    color: _.colorSub
  },
  textGhostMain: {
    color: _.colorSub
  },
  textGhostPrimary: {
    color: _.colorSub
  },
  textGhostSuccess: {
    color: _.colorSub
  },

  // other
  shadow: IOS
    ? {
        shadowColor: _.colorShadow,
        shadowOffset: { height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 3
      }
    : {
        backgroundColor: _.colorPlain,
        elevation: 2
      },
  radius: {
    borderRadius: _.radiusXs
  }
})
