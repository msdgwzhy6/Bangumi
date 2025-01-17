/*
 * @Author: czy0729
 * @Date: 2019-05-15 15:35:54
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-09-30 14:07:14
 */
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Loading, ListView } from '@components'
import { ItemSearch } from '@screens/_'
import _ from '@styles'

function List(props, { $, navigation }) {
  const { searching } = $.state
  if (searching) {
    return <Loading style={_.container.flex} />
  }

  const search = $.search()
  if (!search._loaded) {
    return null
  }

  return (
    <ListView
      style={_.container.screen}
      contentContainerStyle={_.container.bottom}
      keyExtractor={item => String(item.id)}
      data={search}
      renderItem={({ item, index }) => (
        <ItemSearch navigation={navigation} index={index} {...item} />
      )}
      onFooterRefresh={$.doSearch}
    />
  )
}

List.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(List)
