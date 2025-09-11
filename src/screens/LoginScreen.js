import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from '../styles/globals';
import CustomTextInput from '../components/CustomTextInput';
import GlobalButton from '../components/GlobalButton';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short').required('Required'),
});

export default function LoginScreen({ navigation }){
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <Formik initialValues={{ email: '', password: '' }} validationSchema={LoginSchema} onSubmit={()=> navigation.replace('Signup')}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <Text style={styles.fieldLabel}>Email</Text>
            <CustomTextInput
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email ? <Text style={{color:'#F87171', marginBottom:8}}>{errors.email}</Text> : null}

            <Text style={styles.fieldLabel}>Password</Text>
            <CustomTextInput
              placeholder="••••••••"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password ? <Text style={{color:'#F87171', marginBottom:8}}>{errors.password}</Text> : null}

            <GlobalButton title="Login" onPress={handleSubmit} />
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{marginTop:16, alignSelf:'center'}}>
              <Text style={{color:'#6EE7B7'}}>Create an account</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}
