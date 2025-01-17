/*
 * @Author: czy0729
 * @Date: 2019-03-26 00:54:51
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-08-23 00:33:13
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { SectionTitle, HorizontalList } from '@screens/_'
import _ from '@styles'

function Character({ style }, { $, navigation }) {
  const { crt = [] } = $.subject
  if (!crt.length) {
    return null
  }

  const data = crt.map(
    ({
      id,
      images = {},
      name,
      name_cn: nameCn,
      role_name: roleName,
      actors = []
    }) => ({
      id,
      image: images.grid,
      name: nameCn || name,
      desc: (actors[0] && actors[0].name) || roleName
    })
  )
  return (
    <View style={style}>
      <SectionTitle style={_.container.wind}>角色</SectionTitle>
      <HorizontalList
        style={_.mt.sm}
        data={data}
        quality={false}
        onPress={({ id, name, image }) =>
          navigation.push('Mono', {
            monoId: `character/${id}`,
            _name: name,
            _image: image
          })
        }
      />
    </View>
  )
}

Character.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(Character)
