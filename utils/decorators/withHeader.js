/*
 * @Author: czy0729
 * @Date: 2019-05-18 00:32:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-20 17:34:12
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import { StatusBarEvents, Flex, Popover, Menu, Iconfont } from '@components'
import { IconBack } from '@screens/_'
import { IOS } from '@constants'
import _ from '@styles'
import observer from './observer'

const withHeader = ({
  headerStyle,
  headerTitleStyle,
  iconBackColor = _.colorTitle,
  statusBarEvents = true
} = {}) => ComposedComponent =>
  observer(
    class withHeaderComponent extends React.Component {
      static navigationOptions = ({ navigation }) => {
        let headerRight
        const popover = navigation.getParam('popover', {
          data: [],
          onSelect: Function.prototype
        })
        const element = navigation.getParam(
          'element',
          <Iconfont size={24} name='more' color={_.colorTitle} />
        )
        const extra = navigation.getParam('extra')
        if (popover.data.length) {
          const popoverProps = IOS
            ? {
                overlay: (
                  <Menu
                    title={popover.title}
                    data={popover.data}
                    onSelect={popover.onSelect}
                  />
                )
              }
            : {
                data: popover.data,
                onSelect: popover.onSelect
              }
          headerRight = (
            <Flex>
              {extra}
              <Popover
                style={{
                  padding: _.sm,
                  marginRight: -_.sm
                }}
                placement='bottom'
                {...popoverProps}
              >
                {element}
              </Popover>
            </Flex>
          )
        }

        return {
          headerLeft: (
            <IconBack navigation={navigation} color={iconBackColor} />
          ),
          headerRight,
          headerStyle: IOS
            ? {
                borderBottomColor: _.colorBorder,
                borderBottomWidth: StyleSheet.hairlineWidth,
                ...headerStyle
              }
            : {
                borderBottomColor: _.colorBorder,
                borderBottomWidth: StyleSheet.hairlineWidth,
                elevation: 0,
                ...headerStyle
              },
          headerTitleStyle: {
            color: _.colorTitle,
            fontSize: 16 + _.fontSizeAdjust,
            fontWeight: 'normal',
            ...headerTitleStyle
          },
          ...(typeof ComposedComponent.navigationOptions === 'function'
            ? ComposedComponent.navigationOptions({ navigation })
            : ComposedComponent.navigationOptions)
        }
      }

      render() {
        const { navigation } = this.props
        return (
          <>
            {statusBarEvents && <StatusBarEvents />}
            <ComposedComponent navigation={navigation} />
          </>
        )
      }
    }
  )

export default withHeader
