import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { PixelLottie } from '../ui/PixelLottie';
import { C, PANEL } from '@/theme/theme';
import { useReducedMotion } from 'react-native-reanimated';
const opening = require('../../../assets/animations/pixel-newspaper.json');

export interface NewsArticle { id: number; age: number; text: string; tag: string; changes?: string[] }

/** News remains live text; the short, decorative Lottie never gates reading. */
export function VillageNewspaper({ articles, year, reducedMotion, onClose }: { articles: NewsArticle[]; year: number; reducedMotion: boolean; onClose: () => void }) {
  const { height, width } = useWindowDimensions();
  const systemReducedMotion = useReducedMotion();
  const motionOff = reducedMotion || systemReducedMotion;
  const [unfolding, setUnfolding] = useState(!motionOff);
  useEffect(() => {
    if (motionOff) { setUnfolding(false); return; }
    const timer = setTimeout(() => setUnfolding(false), 700);
    return () => clearTimeout(timer);
  }, [motionOff]);
  return <Modal transparent animationType="none" visible onRequestClose={onClose}>
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(13,27,46,0.82)', padding: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View accessibilityViewIsModal style={{ ...PANEL.parchModal, width: '100%', maxWidth: 580, maxHeight: height - 100, padding: 0 }}>
        <View style={{ padding: 10, backgroundColor: C.blue, borderBottomWidth: 3, borderColor: C.blueDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <PixelText font="pixel" size={8} color={C.white}>VILLAGE NEWS</PixelText>
          <PixelButton onPress={onClose} bg={C.lightFill} shadow={C.paleEdge} innerStyle={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }}><PixelText font="pixel" size={8} color={C.blueDark}>CLOSE</PixelText></PixelButton>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <PixelText font="pixel" size={7} color={C.textBrown} style={{ textAlign: 'center' }}>THE VILLAGE CHRONICLE</PixelText>
          <PixelText accessibilityRole="header" font="pixel" size={16} color={C.blueDark} style={{ textAlign: 'center' }}>SWINEFORD{ '\n' }GAZETTE</PixelText>
          <View style={{ borderTopWidth: 2, borderBottomWidth: 2, borderColor: C.textBrown, paddingVertical: 7 }}>
            <PixelText font="body" size={17} color={C.textBrown} style={{ textAlign: 'center' }}>Year {year} · {articles.length} village {articles.length === 1 ? 'dispatch' : 'dispatches'}</PixelText>
          </View>
          <Image source={require('../../../assets/generated/gazette-village-pixel.png')} resizeMode="contain" style={{ width: '100%', height: (Math.min(width - 32, 580) - 40) / 3 }} accessible={false} />
          {articles.map((article, i) => <View key={article.id} style={{ borderTopWidth: i === 0 ? 3 : 1, borderColor: C.parchSd, paddingTop: 12, gap: 8 }}>
            <PixelText font="pixel" size={8} color={C.amber}>{article.tag.includes('ARRIVAL') ? 'NEW FACES IN THE VILLAGE' : 'NEWS FROM THE GUILDS'}</PixelText>
            <PixelText font="body" size={21} color={C.textDark}>{article.text}</PixelText>
            {!!article.changes?.length && <PixelText font="body" size={17} color={C.textBrown}>{article.changes.join(' · ')}</PixelText>}
          </View>)}
          <View style={{ borderTopWidth: 2, borderColor: C.textBrown, paddingTop: 12, paddingBottom: 4 }}>
            <PixelText font="body" size={17} color={C.textMuted} style={{ textAlign: 'center' }}>~ Tidings from thy neighbours ~</PixelText>
          </View>
        </ScrollView>
        {unfolding && <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left: 0, right: 0, top: 66, bottom: 0, backgroundColor: C.parch }}>
          <PixelLottie source={opening} trigger={1} reducedMotion={motionOff} stillProgress={1} />
        </View>}
      </View>
    </SafeAreaView>
  </Modal>;
}
