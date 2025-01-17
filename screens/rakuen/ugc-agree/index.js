/* eslint-disable max-len */
/*
 * @Author: czy0729
 * @Date: 2019-08-31 15:45:18
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-10-20 17:33:46
 */
import React from 'react'
import { ScrollView } from 'react-native'
import { RenderHtml, Flex, Button } from '@components'
import { systemStore } from '@stores'
import { appNavigate } from '@utils/app'
import { withHeader } from '@utils/decorators'
import { hm } from '@utils/fetch'
import _ from '@styles'

const html =
  '<div id="columnA" class="column"><span class="tip">生命有限，Bangumi 是一个<strong>纯粹的ACG网络</strong>，只要明确这一点，你完全可以跳过以下内容的阅读</span><h2 class="home_title">/ Chobits 鼓励</h2><div class="about_text"><ol style="list-style: decimal inside"><li>鼓励分享、互助和开放；</li><li>鼓励宽容和理性地对待不同的看法、喜好和意见；</li><li>鼓励尊重他人的隐私和个人空间；</li><li>鼓励转载注明原作者及来源；</li><li>鼓励精彩原创内容；</li><li>鼓励明确、及时的资源分享和点评；</li><li>鼓励有始有终的自发福利活动。</li></ol></div><h2 class="home_title">/ Bangumi 不提倡</h2><div class="about_text"><ol style="list-style: decimal inside"><li>针对种族、国家、民族、宗教、性别、年龄、地缘、性取向、生理特征的歧视和仇恨言论；</li><li>不雅词句、人身攻击、故意骚扰和恶意使用；</li><li>色情、激进时政、意识形态方面的话题；</li><li>使用脑残体等妨碍视觉与心灵的文字；</li><li>无授权转载，盗图、盗链、盗资源；</li><li>不提倡情绪激动而心灵枯槁的内容；</li><li>不提倡转载过期变质内容；</li><li>不提倡不知所谓的长篇大论；</li><li>不提倡调查贴、投票贴、签名贴。</li></ol></div><h2 class="home_title">/ Bangumi 禁止</h2><div class="about_text"><span class="tip">以下行为视情况<strong>直接删除、锁定或删除ID、批量删除而不予通知</strong>；</span><ol style="list-style: decimal inside"><li>违反中国或 Bangumi 成员所在地法律法规的行为和内容（<a href="https://baike.baidu.com/item/%E4%BA%92%E8%81%94%E7%BD%91%E4%BF%A1%E6%81%AF%E6%9C%8D%E5%8A%A1%E7%AE%A1%E7%90%86%E5%8A%9E%E6%B3%95/243355?fr=aladdin" title="互联网信息服务管理办法">政策法规</a>）；</li><li>威胁他人或 Bangumi 成员自身的人身安全、法律安全的行为；</li><li>对网站的运营安全有潜在威胁的内容。</li></ol></div><hr class="board"><span class="tip_i">指导原则的编写参考了豆瓣以及XQ网站，最后更新日期为：2008-08-06 20:32</span></div>'

export default
@withHeader()
class UGCAgree extends React.Component {
  static navigationOptions = {
    title: '社区指导原则'
  }

  componentDidMount() {
    hm('/about/guideline')
  }

  updateUGCAgree = value => {
    const { navigation } = this.props
    systemStore.updateUGCAgree(value)

    if (value) {
      const topicId = navigation.getParam('topicId')
      if (topicId) {
        navigation.goBack()
        setTimeout(() => {
          navigation.push('Topic', {
            topicId
          })
        }, 300)
      } else {
        navigation.goBack()
      }
    } else {
      navigation.goBack()
    }
  }

  render() {
    const { navigation } = this.props
    return (
      <ScrollView
        style={[_.container.screen, _.container.outer]}
        contentContainerStyle={_.container.bottom}
      >
        <RenderHtml
          html={html}
          baseFontStyle={{
            fontSize: 13 + _.fontSizeAdjust,
            lineHeight: 22,
            color: _.colorTitle
          }}
          onLinkPress={href => appNavigate(href, navigation)}
        />
        <Flex style={_.mt.lg}>
          <Flex.Item>
            <Button onPress={() => this.updateUGCAgree(false)}>不同意</Button>
          </Flex.Item>
          <Flex.Item style={_.ml.md}>
            <Button
              type='ghostSuccess'
              onPress={() => this.updateUGCAgree(true)}
            >
              知悉并同意
            </Button>
          </Flex.Item>
        </Flex>
      </ScrollView>
    )
  }
}
