import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function CustomTextInput({ style, ...props }){
  return (
    <View style={styles.wrap}>
      <TextInput placeholderTextColor={colors.muted} style={[styles.input, style]} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  }
});
