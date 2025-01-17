/*
 * @Author: czy0729
 * @Date: 2019-03-31 10:25:46
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-07 16:19:31
 */
import React from 'react'
import { View } from 'react-native'
import { NavigationEvents } from 'react-navigation'
import { observer } from 'mobx-react'
import { StatusBarEvents, Text, Button } from '@components'
import { IconTabsHeader, IconTinygrail, IconTabBar } from '@screens/_'
import { hm } from '@utils/fetch'
import { userStore } from '@stores'
import _ from '@styles'

export default
@observer
class Auth extends React.Component {
  static navigationOptions = {
    header: null,
    tabBarIcon: ({ tintColor }) => <IconTabBar name='star' color={tintColor} />,
    tabBarLabel: '进度'
  }

  componentDidMount() {
    hm('auth')
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={[_.container.column, { backgroundColor: _.colorBg }]}>
        <StatusBarEvents backgroundColor='transparent' />
        <IconTabsHeader
          style={_.header.left}
          name='setting'
          color={_.colorSub}
          onPress={() => navigation.push('Setting')}
        />
        <IconTabsHeader
          style={_.header.right}
          name='search'
          color={_.colorSub}
          onPress={() => navigation.push('Search')}
        />
        <IconTinygrail
          style={[
            _.header.right,
            {
              right: 44
            }
          ]}
          color={_.colorSub}
          navigation={navigation}
        />
        <NavigationEvents
          onWillFocus={() => {
            if (userStore.isLogin) {
              navigation.navigate('Home')
            }
          }}
        />
        <Text type='sub' size={16}>
          使用Bangumi管理观看进度
        </Text>
        <Button
          style={[
            {
              width: 160,
              marginBottom: _.lg
            },
            _.mt.md
          ]}
          shadow
          onPress={() => navigation.push('LoginV2')}
        >
          现在登陆
        </Button>
      </View>
    )
  }
}
