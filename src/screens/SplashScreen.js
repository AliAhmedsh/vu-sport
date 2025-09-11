import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import colors from '../styles/colors';

export default function SplashScreen({ navigation }){
  useEffect(()=>{
    const t = setTimeout(()=> navigation.replace('Login'), 1200);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <Image source={require('../../assets/splash.png')} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  logo: { width: '70%', height: 160 },
});
