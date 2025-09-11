import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from '../styles/globals';
import CustomTextInput from '../components/CustomTextInput';
import GlobalButton from '../components/GlobalButton';

const SignupSchema = Yup.object().shape({
  fullName: Yup.string().min(2).required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short').required('Required'),
});

export default function SignupScreen({ navigation }){
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <Formik initialValues={{ fullName:'', email: '', password: '' }} validationSchema={SignupSchema} onSubmit={()=> navigation.replace('Login')}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <CustomTextInput
              placeholder="John Smith"
              onChangeText={handleChange('fullName')}
              onBlur={handleBlur('fullName')}
              value={values.fullName}
            />
            {touched.fullName && errors.fullName ? <Text style={{color:'#F87171', marginBottom:8}}>{errors.fullName}</Text> : null}

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

            <GlobalButton title="Create Account" onPress={handleSubmit} />
            <TouchableOpacity onPress={() => navigation.replace('Login')} style={{marginTop:16, alignSelf:'center'}}>
              <Text style={{color:'#6EE7B7'}}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}
