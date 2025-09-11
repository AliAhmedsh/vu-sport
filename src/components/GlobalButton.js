import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function GlobalButton({ title, onPress, loading, style, textStyle }){
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, style]} disabled={loading}>
      {loading ? <ActivityIndicator /> : <Text style={[styles.txt, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  txt: {
    color: '#0B1220',
    fontSize: 16,
    fontWeight: '700'
  }
});
