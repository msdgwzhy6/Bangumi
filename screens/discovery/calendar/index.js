/*
 * @Author: czy0729
 * @Date: 2019-03-22 08:46:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-06 15:17:50
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Loading } from '@components'
import { open } from '@utils'
import { inject, withHeader, observer } from '@utils/decorators'
import { hm } from '@utils/fetch'
import { HTML_CALENDAR } from '@constants/html'
import _ from '@styles'
import List from './list'
import Store from './store'

export default
@inject(Store)
@withHeader()
@observer
class Calendar extends React.Component {
  static navigationOptions = {
    title: '每日放送'
  }

  static contextTypes = {
    $: PropTypes.object,
    navigation: PropTypes.object
  }

  componentDidMount() {
    const { $, navigation } = this.context
    $.init()

    navigation.setParams({
      popover: {
        data: ['浏览器查看'],
        onSelect: key => {
          switch (key) {
            case '浏览器查看':
              open(HTML_CALENDAR())
              break
            default:
              break
          }
        }
      }
    })

    hm('calendar')
  }

  render() {
    const { $ } = this.context
    const { _loaded } = $.calendar
    if (!_loaded) {
      return <Loading style={_.container.flex} />
    }
    return <List />
  }
}
