/*
 * @Author: czy0729
 * @Date: 2019-08-25 19:12:19
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-20 21:55:09
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { inject, withHeader, observer } from '@utils/decorators'
import { hm } from '@utils/fetch'
import _ from '@styles'
import { headerStyle, colorContainer } from '../styles'
import StatusBarEvents from '../_/status-bar-events'
import Tabs from '../_/tabs'
import List from './list'
import Store, { tabs } from './store'

export default
@inject(Store)
@withHeader(headerStyle)
@observer
class TinygrailICO extends React.Component {
  static navigationOptions = {
    title: 'ICO榜单'
  }

  static contextTypes = {
    $: PropTypes.object,
    navigation: PropTypes.object
  }

  componentDidMount() {
    const { $ } = this.context
    $.init()

    hm('tinygrail/ico')
  }

  render() {
    const { $ } = this.context
    const { _loaded } = $.state
    return (
      <View
        style={[
          _.container.flex,
          {
            backgroundColor: colorContainer
          }
        ]}
      >
        <StatusBarEvents />
        {!!_loaded && (
          <Tabs tabs={tabs}>
            {tabs.map((item, index) => (
              <List key={item.key} index={index} />
            ))}
          </Tabs>
        )}
      </View>
    )
  }
}
