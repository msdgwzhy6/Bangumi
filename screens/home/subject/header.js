/*
 * @Author: czy0729
 * @Date: 2019-04-12 12:15:41
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-08-24 01:55:08
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Text, Flex, Loading } from '@components'
import { SectionTitle, IconReverse } from '@screens/_'
import _ from '@styles'
import Head from './head'
import Box from './box'
import Ep from './ep'
import Tags from './tags'
import Summary from './summary'
import Info from './info'
import Rating from './rating'
import Character from './character'
import Staff from './staff'
import Relations from './relations'
import Comic from './comic'
import Like from './like'
import Recent from './recent'
import Blog from './blog'
import Topic from './topic'

function Header(props, { $ }) {
  const {
    pagination: { pageTotal = 0 },
    _reverse,
    _loaded
  } = $.subjectComments
  return (
    <>
      <Head />
      <View style={styles.content}>
        <Box style={_.mt.md} />
        <Ep style={_.mt.lg} />
        <Tags style={_.mt.lg} />
        <Summary style={_.mt.lg} />
        <Info style={_.mt.lg} />
        <Rating style={_.mt.lg} />
        <Character style={_.mt.lg} />
        <Staff style={_.mt.lg} />
        <Relations style={_.mt.lg} />
        <Comic style={_.mt.lg} />
        <Like style={_.mt.lg} />
        <Recent style={_.mt.lg} />
        <Blog style={_.mt.lg} />
        <Topic style={_.mt.lg} />
        <SectionTitle
          style={[styles.title, _.mt.lg]}
          right={
            <IconReverse
              style={styles.sort}
              color={_reverse ? _.colorMain : _.colorIcon}
              onPress={$.toggleReverseComments}
            />
          }
        >
          吐槽箱{' '}
          <Text size={12} type='sub' lineHeight={24}>
            ({20 * pageTotal}+)
          </Text>
        </SectionTitle>
        {!_loaded && (
          <Flex style={styles.loading} justify='center'>
            <Loading />
          </Flex>
        )}
      </View>
    </>
  )
}

Header.contextTypes = {
  $: PropTypes.object
}

export default observer(Header)

const styles = StyleSheet.create({
  content: {
    minHeight: _.window.height * 0.5,
    backgroundColor: _.colorPlain
  },
  title: {
    paddingHorizontal: _.wind
  },
  sort: {
    marginRight: -_.sm
  },
  loading: {
    height: 240
  }
})
