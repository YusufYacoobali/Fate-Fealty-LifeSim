import React from 'react';
import { ScrollView } from 'react-native';
import { PixelButton } from './PixelButton';
import { PixelText } from './PixelText';
import { C } from '@/theme/theme';

export function PanelChips<T extends string>({ items, value, onChange }: { items: readonly { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginVertical: 8 }} contentContainerStyle={{ gap: 6, paddingBottom: 3 }}>
    {items.map(item => <PixelButton key={item.id} selected={item.id === value} bg={item.id === value ? C.charm : C.lightFill} shadow={C.parchSd} onPress={() => onChange(item.id)} innerStyle={{ paddingHorizontal: 10, paddingVertical: 10, minHeight: 44, justifyContent: 'center' }}><PixelText font="pixel" size={7}>{item.label}</PixelText></PixelButton>)}
  </ScrollView>;
}
