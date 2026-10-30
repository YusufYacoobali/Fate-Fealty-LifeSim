import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import type { WorldCharacter } from '@/types/game';
import { PixelButton } from './PixelButton';
import { PixelText } from './PixelText';
import { C, FONT, textSize } from '@/theme/theme';

/** A small, action-filtered list; it never renders the whole world as buttons. */
export function PersonPicker({ people, value, onChange }: { people: WorldCharacter[]; value?: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [limit, setLimit] = useState(6);
  const selected = people.find(c => c.id === value);
  const filtered = people.filter(c => c.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <View style={{ marginVertical: 8 }}>
    <PixelButton bg={C.lightFill} shadow={C.parchSd} onPress={() => setOpen(!open)} innerStyle={{ padding: 10, minHeight: 46 }}><PixelText size={17}>{selected ? `${selected.name} · ${selected.age}` : 'Choose an eligible person'} {open ? '▴' : '▾'}</PixelText></PixelButton>
    {open && <View style={{ marginTop: 8 }}>
      <TextInput accessibilityLabel="Search eligible people" placeholder="Search eligible people" placeholderTextColor={C.textMuted} value={query} onChangeText={text => { setQuery(text); setLimit(6); }} style={{ fontFamily: FONT.body, fontSize: textSize(16), backgroundColor: C.parch, color: C.textDark, borderColor: C.inkSoft, borderWidth: 2, padding: 10, minHeight: 44, marginBottom: 6 }} />
      {filtered.slice(0,limit).map(c => <PixelButton key={c.id} bg={C.parch} shadow={C.parchSd} onPress={() => { onChange(c.id); setOpen(false); }} style={{ marginBottom: 6 }} innerStyle={{ padding: 10, minHeight: 44 }}><PixelText size={16}>{c.name} · {c.age} · {c.role}</PixelText></PixelButton>)}
      {!filtered.length && <PixelText size={15}>No eligible people match this search.</PixelText>}
      {filtered.length > limit && <PixelButton bg={C.lightFill} shadow={C.parchSd} onPress={() => setLimit(limit + 6)} innerStyle={{ padding: 10 }}><PixelText size={15}>Show six more ({filtered.length - limit} remaining)</PixelText></PixelButton>}
    </View>}
  </View>;
}
